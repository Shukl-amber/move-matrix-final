import { GoogleGenerativeAI } from "@google/generative-ai";
import { IPrimitive } from '../db/models/primitive';
import { IComposition } from '../db/models/composition';

// Configuration for Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = "gemini-2.5-pro-exp-03-25";

// Initialize the Google GenAI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// System prompt with few-shot examples of popular Move smart contracts
const SYSTEM_PROMPT = `
You are an expert Move language developer specialized in creating DeFi protocols for the Aptos blockchain.
Your task is to refine and improve the provided Move code to make it more efficient, secure, and ready for deployment.
Focus on:
1. Proper syntax and adherence to Move language best practices
2. Security considerations specific to DeFi protocols
3. Gas optimization
4. Error handling with descriptive error codes
5. Complete implementation of all functions

Here are examples of well-structured Move smart contracts:

Example 1: rewards_pool
\`\`\`move
/// An example module that manages rewards for multiple tokens on a per-epoch basis. Rewards can be added for multiple
/// tokens by anyone for any epoch but only friended modules can increase/decrease claimer shares.
///
/// This module is designed to be integrated into a complete system that manages epochs and rewards.
///
/// The flow works as below:
/// 1. A rewards pool is created with a set of reward tokens (fungible assets). If coins are to be used as rewards,
/// developers can use the coin_wrapper module from move-examples/swap to convert coins into fungible assets.
/// 2. Anyone can add rewards to the pool for any epoch for multiple tokens by calling add_rewards.
/// 3. Friended modules can increase/decrease claimer shares for current epoch by calling increase_allocation and
/// decrease_allocation.
/// 4. Claimers can claim their rewards in all tokens for any epoch that has ended by calling claim_rewards, which
/// return a vector of all the rewards. Claiming also removes the claimer's shares from that epoch's rewards as their
/// rewards have all been claimed.
///
/// Although claimers have to be signers, this module can be easily modified to support objects (e.g. NFTs) as claimers.
module rewards_pool::rewards_pool {
    use aptos_framework::fungible_asset::{Self, FungibleAsset, FungibleStore, Metadata};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::object::{Self, Object, ExtendRef};
    use aptos_std::pool_u64_unbound::{Self as pool_u64, Pool};
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_std::smart_table::{Self, SmartTable};

    use rewards_pool::epoch;

    use std::signer;
    use std::vector;

    /// Rewards can only be claimed for epochs that have ended.
    const EREWARDS_CANNOT_BE_CLAIMED_FOR_CURRENT_EPOCH: u64 = 1;
    /// The rewards pool does not support the given reward token type.
    const EREWARD_TOKEN_NOT_SUPPORTED: u64 = 2;

    /// Data regarding the rewards to be distributed for a specific epoch.
    struct EpochRewards has store {
        /// Total amount of rewards for each reward token added to this epoch.
        total_amounts: SimpleMap<Object<Metadata>, u64>,
        /// Pool representing the claimer shares in this epoch.
        claimer_pool: Pool,
    }

    /// Data regarding the store object for a specific reward token.
    struct RewardStore has store {
        /// The fungible store for this reward token.
        store: Object<FungibleStore>,
        /// We need to keep the fungible store's extend ref to be able to transfer rewards from it during claiming.
        store_extend_ref: ExtendRef,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct RewardsPool has key {
        /// A mapping to track per epoch rewards data.
        epoch_rewards: SmartTable<u64, EpochRewards>,
        /// The stores where rewards are kept.
        reward_stores: SimpleMap<Object<Metadata>, RewardStore>,
    }

    /// Create a new rewards pool with the given reward tokens (fungible assets only)
    public entry fun create_entry(reward_tokens: vector<Object<Metadata>>) {
        create(reward_tokens);
    }

    /// Create a new rewards pool with the given reward tokens (fungible assets only)
    public fun create(reward_tokens: vector<Object<Metadata>>): Object<RewardsPool> {
        // The owner of the object doesn't matter as there are no owner-based permissions.
        // If developers want to be extra cautious here, they can make the owner @0x0.
        // Here the reward pool also doesn't keep an ExtendRef so there would be no way to obtain its signer.
        let rewards_pool_constructor_ref = &object::create_object(@rewards_pool);
        let rewards_pool_signer = &object::generate_signer(rewards_pool_constructor_ref);
        let rewards_pool_addr = signer::address_of(rewards_pool_signer);
        let reward_stores = simple_map::new();
        vector::for_each(reward_tokens, |reward_token| {
            let reward_token: Object<Metadata> = reward_token;
            let store_constructor_ref = &object::create_object(rewards_pool_addr);
            let store = fungible_asset::create_store(store_constructor_ref, reward_token);
            simple_map::add(&mut reward_stores, reward_token, RewardStore {
                store,
                // The extend ref for the rewards store is kept so we can withdraw rewards from it later when
                // claimers claim their rewards.
                store_extend_ref: object::generate_extend_ref(store_constructor_ref),
            });
        });
        move_to(rewards_pool_signer, RewardsPool {
            epoch_rewards: smart_table::new(),
            reward_stores,
        });
        object::object_from_constructor_ref(rewards_pool_constructor_ref)
    }

    #[view]
    /// Return all the reward tokens supported by the rewards pool.
    public fun reward_tokens(rewards_pool: Object<RewardsPool>): vector<Object<Metadata>> acquires RewardsPool {
        simple_map::keys(&safe_rewards_pool_data(&rewards_pool).reward_stores)
    }

    #[view]
    /// Return the current shares and total shares of a given claimer for a given rewards pool and epoch.
    public fun claimer_shares(
        claimer: address,
        rewards_pool: Object<RewardsPool>,
        epoch: u64,
    ): (u64, u64) acquires RewardsPool {
        let epoch_rewards = smart_table::borrow(&safe_rewards_pool_data(&rewards_pool).epoch_rewards, epoch);
        let shares = (pool_u64::shares(&epoch_rewards.claimer_pool, claimer) as u64);
        let total_shares = (pool_u64::total_shares(&epoch_rewards.claimer_pool) as u64);
        (shares, total_shares)
    }

    #[view]
    /// Return the amounts of claimable rewards for a given claimer, rewards pool, and epoch.
    /// The return value is a vector of reward tokens and a vector of amounts.
    public fun claimable_rewards(
        claimer: address,
        rewards_pool: Object<RewardsPool>,
        epoch: u64,
    ): (vector<Object<Metadata>>, vector<u64>) acquires RewardsPool {
        assert!(epoch < epoch::now(), EREWARDS_CANNOT_BE_CLAIMED_FOR_CURRENT_EPOCH);
        let all_rewards_tokens = reward_tokens(rewards_pool);
        let non_empty_reward_tokens = vector[];
        let reward_per_tokens = vector[];
        let rewards_pool_data = safe_rewards_pool_data(&rewards_pool);
        vector::for_each(all_rewards_tokens, |reward_token| {
            let reward = rewards(claimer, rewards_pool_data, reward_token, epoch);
            if (reward > 0) {
                vector::push_back(&mut non_empty_reward_tokens, reward_token);
                vector::push_back(&mut reward_per_tokens, reward);
            };
        });
        (non_empty_reward_tokens, reward_per_tokens)
    }

    /// Allow a claimer to claim the rewards for a past epoch.
    /// This returns a vector of rewards for all reward tokens.
    public entry fun claim_rewards_entry(
        claimer: &signer,
        rewards_pool: Object<RewardsPool>,
        epoch: u64,
    ) acquires RewardsPool {
        let rewards = claim_rewards(claimer, rewards_pool, epoch);
        let claimer_addr = signer::address_of(claimer);
        vector::for_each_reverse(rewards, |r| primary_fungible_store::deposit(claimer_addr, r));
    }

    /// Allow a claimer to claim the rewards for all tokens for a past epoch.
    /// This returns a vector of rewards for all reward tokens in the same order as the rewards tokens.
    /// If there's no reward for a specific reward token, the corresponding returned reward asset will be of zero
    /// amount (created via fungible_asset::zero).
    public fun claim_rewards(
        claimer: &signer,
        rewards_pool: Object<RewardsPool>,
        epoch: u64,
    ): vector<FungibleAsset> acquires RewardsPool {
        assert!(epoch < epoch::now(), EREWARDS_CANNOT_BE_CLAIMED_FOR_CURRENT_EPOCH);
        let reward_tokens = reward_tokens(rewards_pool);
        let rewards = vector[];
        let claimer_addr = signer::address_of(claimer);
        let rewards_data = unchecked_mut_rewards_pool_data(&rewards_pool);
        vector::for_each(reward_tokens, |reward_token| {
            let reward = rewards(claimer_addr, rewards_data, reward_token, epoch);
            let reward_store = simple_map::borrow(&rewards_data.reward_stores, &reward_token);
            if (reward == 0) {
                vector::push_back(
                    &mut rewards,
                    fungible_asset::zero(fungible_asset::store_metadata(reward_store.store)),
                );
            } else {
                // Withdraw the reward from the corresponding store.
                let store_signer = &object::generate_signer_for_extending(&reward_store.store_extend_ref);
                vector::push_back(&mut rewards, fungible_asset::withdraw(store_signer, reward_store.store, reward));

                // Update the remaining amount of rewards for the epoch.
                let epoch_rewards = smart_table::borrow_mut(&mut rewards_data.epoch_rewards, epoch);
                let total_token_rewards = simple_map::borrow_mut(&mut epoch_rewards.total_amounts, &reward_token);
                *total_token_rewards = *total_token_rewards - reward;
            };
        });

        // Remove the claimer's allocation in the epoch as they have now claimed all rewards for that epoch.
        let epoch_rewards = smart_table::borrow_mut(&mut rewards_data.epoch_rewards, epoch);
        let all_shares = pool_u64::shares(&epoch_rewards.claimer_pool, claimer_addr);
        if (all_shares > 0) {
            pool_u64::redeem_shares(&mut epoch_rewards.claimer_pool, claimer_addr, all_shares);
        };

        rewards
    }

    /// Add rewards to the specified rewards pool. This can be called with multiple reward tokens.
    public fun add_rewards(
        rewards_pool: Object<RewardsPool>,
        fungible_assets: vector<FungibleAsset>,
        epoch: u64,
    ) acquires RewardsPool {
        let rewards_data = unchecked_mut_rewards_pool_data(&rewards_pool);
        let reward_stores = &rewards_data.reward_stores;
        vector::for_each(fungible_assets, |fa| {
            let amount = fungible_asset::amount(&fa);
            let reward_token = fungible_asset::metadata_from_asset(&fa);
            assert!(simple_map::contains_key(reward_stores, &reward_token), EREWARD_TOKEN_NOT_SUPPORTED);

            // Deposit the rewards into the corresponding store.
            let reward_store = simple_map::borrow(reward_stores, &reward_token);
            fungible_asset::deposit(reward_store.store, fa);

            // Update total amount of rewards for this token for this epoch.
            let total_amounts = &mut epoch_rewards_or_default(&mut rewards_data.epoch_rewards, epoch).total_amounts;
            if (simple_map::contains_key(total_amounts, &reward_token)) {
                let current_amount = simple_map::borrow_mut(total_amounts, &reward_token);
                *current_amount = *current_amount + amount;
            } else {
                simple_map::add(total_amounts, reward_token, amount);
            };
        });
    }

    /// This should only be called by system modules to increase the shares of a claimer for the current epoch.
    public(friend) fun increase_allocation(
        claimer: address,
        rewards_pool: Object<RewardsPool>,
        amount: u64,
    ) acquires RewardsPool {
        let epoch_rewards = &mut unchecked_mut_rewards_pool_data(&rewards_pool).epoch_rewards;
        let current_epoch_rewards = epoch_rewards_or_default(epoch_rewards, epoch::now());
        pool_u64::buy_in(&mut current_epoch_rewards.claimer_pool, claimer, amount);
    }

    /// This should only be called by system modules to decrease the shares of a claimer for the current epoch.
    public(friend) fun decrease_allocation(
        claimer: address,
        rewards_pool: Object<RewardsPool>,
        amount: u64,
    ) acquires RewardsPool {
        let epoch_rewards = &mut unchecked_mut_rewards_pool_data(&rewards_pool).epoch_rewards;
        let current_epoch_rewards = epoch_rewards_or_default(epoch_rewards, epoch::now());
        pool_u64::redeem_shares(&mut current_epoch_rewards.claimer_pool, claimer, (amount as u128));
    }

    fun rewards(
        claimer: address,
        rewards_pool_data: &RewardsPool,
        reward_token: Object<Metadata>,
        epoch: u64,
    ): u64 {
        // No rewards (in any tokens) have been added for this epoch.
        if (!smart_table::contains(&rewards_pool_data.epoch_rewards, epoch)) {
            return 0
        };
        let epoch_rewards = smart_table::borrow(&rewards_pool_data.epoch_rewards, epoch);
        // No rewards have been added for this reward token.
        if (!simple_map::contains_key(&epoch_rewards.total_amounts, &reward_token)) {
            return 0
        };

        // Return the claimer's shares of the current total rewards for the epoch.
        let total_token_rewards = *simple_map::borrow(&epoch_rewards.total_amounts, &reward_token);
        let claimer_shares = pool_u64::shares(&epoch_rewards.claimer_pool, claimer);
        pool_u64::shares_to_amount_with_total_coins(&epoch_rewards.claimer_pool, claimer_shares, total_token_rewards)
    }

    inline fun safe_rewards_pool_data(
        rewards_pool: &Object<RewardsPool>,
    ): &RewardsPool acquires RewardsPool {
        borrow_global<RewardsPool>(object::object_address(rewards_pool))
    }

    inline fun epoch_rewards_or_default(
        epoch_rewards: &mut SmartTable<u64, EpochRewards>,
        epoch: u64,
    ): &mut EpochRewards acquires RewardsPool {
        if (!smart_table::contains(epoch_rewards, epoch)) {
            smart_table::add(epoch_rewards, epoch, EpochRewards {
                total_amounts: simple_map::new(),
                claimer_pool: pool_u64::create(),
            });
        };
        smart_table::borrow_mut(epoch_rewards, epoch)
    }

    inline fun unchecked_mut_rewards_pool_data(
        rewards_pool: &Object<RewardsPool>,
    ): &mut RewardsPool acquires RewardsPool {
        borrow_global_mut<RewardsPool>(object::object_address(rewards_pool))
    }

    #[test_only]
    friend rewards_pool::rewards_pool_tests;
}
\`\`\`

Example 2: Liquidity Pool
\`\`\`move
/// This module provides a common type of liquidity pool that supports both volatile and stable token pairs. It uses
/// fungible assets underneath and needs a separate router + coin_wrapper to support coins (different standard from
/// fungible assets). Swap fees are kept separately from the pool's reserves and thus don't compound.
///
/// For volatile pairs, the price and reserves can be computed using the constant product formula k = x * y.
/// For stable pairs, the price is computed using k = x^3 * y + x * y^3.
///
/// Note that all functions that return fungible assets such as swap, burn, claim_fees are friend-only since they might
/// return an internal wrapper fungible assets. The router or other modules should provide interface to call these based
/// on the underlying tokens of the pool - whether they're coins or fungible assets. See router.move for an example.
///
/// Another important thing to note is that all transfers of the LP tokens have to call via this module. This is
/// required so that fees are correctly updated for LPs. fungible_asset::transfer and primary_fungible_store::transfer
/// are not supported
module swap::liquidity_pool {
    use aptos_framework::event;
    use aptos_framework::fungible_asset::{
        Self, FungibleAsset, FungibleStore, Metadata,
        BurnRef, MintRef, TransferRef,
    };
    use aptos_framework::object::{Self, ConstructorRef, Object};
    use aptos_framework::primary_fungible_store;
    use aptos_std::comparator;
    use aptos_std::math128;
    use aptos_std::math64;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_std::smart_vector::{Self, SmartVector};

    use swap::coin_wrapper;
    use swap::package_manager;

    use std::bcs;
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;

    friend swap::router;

    const FEE_SCALE: u64 = 10000;
    const LP_TOKEN_DECIMALS: u8 = 8;
    const MINIMUM_LIQUIDITY: u64 = 1000;
    const MAX_SWAP_FEES_BPS: u64 = 25; // 0.25%

    /// Amount of tokens provided must be greater than zero.
    const EZERO_AMOUNT: u64 = 1;
    /// The amount of liquidity provided is so small that corresponding LP token amount is rounded to zero.
    const EINSUFFICIENT_LIQUIDITY_MINTED: u64 = 2;
    /// Amount of LP tokens redeemed is too small, so amounts of tokens received back are rounded to zero.
    const EINSUFFICIENT_LIQUIDITY_REDEEMED: u64 = 3;
    /// The specified amount of output tokens is incorrect and does not maintain the pool's invariant.
    const EINCORRECT_SWAP_AMOUNT: u64 = 4;
    /// The caller is not the owner of the LP token store.
    const ENOT_STORE_OWNER: u64 = 5;
    /// Claler is not authorized to perform the operation.
    const ENOT_AUTHORIZED: u64 = 6;
    /// All swaps are currently paused.
    const ESWAPS_ARE_PAUSED: u64 = 7;
    /// Swap leaves pool in a worse state than before.
    const EK_BEFORE_SWAP_GREATER_THAN_EK_AFTER_SWAP: u64 = 8;

    struct LPTokenRefs has store {
        burn_ref: BurnRef,
        mint_ref: MintRef,
        transfer_ref: TransferRef,
    }

    /// Stored in the protocol's account for configuring liquidity pools.
    struct LiquidityPoolConfigs has key {
        all_pools: SmartVector<Object<LiquidityPool>>,
        is_paused: bool,
        fee_manager: address,
        pauser: address,
        pending_fee_manager: address,
        pending_pauser: address,
        stable_fee_bps: u64,
        volatile_fee_bps: u64,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct LiquidityPool has key {
        token_store_1: Object<FungibleStore>,
        token_store_2: Object<FungibleStore>,
        fees_store_1: Object<FungibleStore>,
        fees_store_2: Object<FungibleStore>,
        lp_token_refs: LPTokenRefs,
        swap_fee_bps: u64,
        is_stable: bool,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct FeesAccounting has key {
        total_fees_1: u128,
        total_fees_2: u128,
        total_fees_at_last_claim_1: SmartTable<address, u128>,
        total_fees_at_last_claim_2: SmartTable<address, u128>,
        claimable_1: SmartTable<address, u128>,
        claimable_2: SmartTable<address, u128>,
    }

    #[event]
    /// Event emitted when a pool is created.
    struct CreatePool has drop, store {
        pool: Object<LiquidityPool>,
        token_1: Object<Metadata>,
        token_2: Object<Metadata>,
        is_stable: bool,
    }

    #[event]
    /// Event emitted when a swap happens.
    struct Swap has drop, store {
        pool: address,
        from_token: Object<Metadata>,
        amount_in: u64,
    }

    public entry fun initialize() {
        if (is_initialized()) {
            return
        };

        coin_wrapper::initialize();
        let swap_signer = &package_manager::get_signer();
        move_to(swap_signer, LiquidityPoolConfigs {
            all_pools: smart_vector::new(),
            is_paused: false,
            fee_manager: @deployer,
            pauser: @deployer,
            pending_fee_manager: @0x0,
            pending_pauser: @0x0,
            stable_fee_bps: 10, // 0.1%
            volatile_fee_bps: 20, // 0.2%
        });
    }

    #[view]
    public fun is_initialized(): bool {
        exists<LiquidityPoolConfigs>(@swap)
    }

    #[view]
    public fun total_number_of_pools(): u64 acquires LiquidityPoolConfigs {
        smart_vector::length(&safe_liquidity_pool_configs().all_pools)
    }

    #[view]
    public fun all_pools(): vector<Object<LiquidityPool>> acquires LiquidityPoolConfigs {
        let all_pools = &safe_liquidity_pool_configs().all_pools;
        let results = vector[];
        let len = smart_vector::length(all_pools);
        let i = 0;
        while (i < len) {
            vector::push_back(&mut results, *smart_vector::borrow(all_pools, i));
            i = i + 1;
        };
        results
    }

    #[view]
    public fun liquidity_pool(
        token_1: Object<Metadata>,
        token_2: Object<Metadata>,
        is_stable: bool,
    ): Object<LiquidityPool> {
        object::address_to_object(liquidity_pool_address(token_1, token_2, is_stable))
    }

    #[view]
    public fun liquidity_pool_address_safe(
        token_1: Object<Metadata>,
        token_2: Object<Metadata>,
        is_stable: bool,
    ): (bool, address) {
        let pool_address = liquidity_pool_address(token_1, token_2, is_stable);
        (exists<LiquidityPool>(pool_address), pool_address)
    }

    #[view]
    public fun liquidity_pool_address(
        token_1: Object<Metadata>,
        token_2: Object<Metadata>,
        is_stable: bool,
    ): address {
        if (!is_sorted(token_1, token_2)) {
            return liquidity_pool_address(token_2, token_1, is_stable)
        };
        object::create_object_address(&@swap, get_pool_seeds(token_1, token_2, is_stable))
    }

    #[view]
    public fun lp_token_supply<T: key>(pool: Object<T>): u128 {
        option::destroy_some(fungible_asset::supply(pool))
    }

    #[view]
    public fun pool_reserves<T: key>(pool: Object<T>): (u64, u64) acquires LiquidityPool {
        let pool_data = liquidity_pool_data(&pool);
        (
            fungible_asset::balance(pool_data.token_store_1),
            fungible_asset::balance(pool_data.token_store_2),
        )
    }

    #[view]
    public fun supported_token_strings(pool: Object<LiquidityPool>): vector<String> acquires LiquidityPool {
        vector::map(supported_inner_assets(pool), |a| coin_wrapper::get_original(a))
    }

    #[view]
    public fun supported_coins(pool: Object<LiquidityPool>): vector<String> acquires LiquidityPool {
        let coins = vector[];
        vector::for_each(supported_inner_assets(pool), |a| {
            if (coin_wrapper::is_wrapper(a)) {
                vector::push_back(&mut coins, coin_wrapper::get_coin_type(a))
            };
        });
        coins
    }

    #[view]
    public fun supported_native_fungible_assets(
        pool: Object<LiquidityPool>,
    ): vector<Object<Metadata>> acquires LiquidityPool {
        vector::filter(supported_inner_assets(pool), |a| !coin_wrapper::is_wrapper(*a))
    }

    #[view]
    public fun supported_inner_assets(pool: Object<LiquidityPool>): vector<Object<Metadata>> acquires LiquidityPool {
        let pool_data = liquidity_pool_data(&pool);
        vector[
            fungible_asset::store_metadata(pool_data.token_store_1),
            fungible_asset::store_metadata(pool_data.token_store_2),
        ]
    }

    #[view]
    public fun is_sorted(token_1: Object<Metadata>, token_2: Object<Metadata>): bool {
        let token_1_addr = object::object_address(&token_1);
        let token_2_addr = object::object_address(&token_2);
        comparator::is_smaller_than(&comparator::compare(&token_1_addr, &token_2_addr))
    }

    #[view]
    public fun is_stable(pool: Object<LiquidityPool>): bool acquires LiquidityPool {
        liquidity_pool_data(&pool).is_stable
    }

    #[view]
    public fun swap_fee_bps(pool: Object<LiquidityPool>): u64 acquires LiquidityPool {
        liquidity_pool_data(&pool).swap_fee_bps
    }

    #[view]
    public fun min_liquidity(): u64 {
        MINIMUM_LIQUIDITY
    }

    #[view]
    public fun claimable_fees(lp: address, pool: Object<LiquidityPool>): (u128, u128) acquires FeesAccounting {
        let fees_accounting = safe_fees_accounting(&pool);
        (
            *smart_table::borrow_with_default(&fees_accounting.claimable_1, lp, &0),
            *smart_table::borrow_with_default(&fees_accounting.claimable_2, lp, &0),
        )
    }

    /// Creates a new liquidity pool.
    public fun create(
        token_1: Object<Metadata>,
        token_2: Object<Metadata>,
        is_stable: bool,
    ): Object<LiquidityPool> acquires LiquidityPoolConfigs {
        if (!is_sorted(token_1, token_2)) {
            return create(token_2, token_1, is_stable)
        };
        let configs = unchecked_mut_liquidity_pool_configs();

        // The liquidity pool will serve 3 separate roles:
        // 1. Represent the liquidity pool that LPs and users interact with to add/remove liquidity and swap tokens.
        // 2. Represent the metadata of the LP token.
        // 3. Store the min liquidity that will be locked into the pool when initial liquidity is added.
        let pool_constructor_ref = create_lp_token(token_1, token_2, is_stable);
        let pool_signer = &object::generate_signer(pool_constructor_ref);
        let lp_token = object::object_from_constructor_ref<Metadata>(pool_constructor_ref);
        fungible_asset::create_store(pool_constructor_ref, lp_token);
        move_to(pool_signer, LiquidityPool {
            token_store_1: create_token_store(pool_signer, token_1),
            token_store_2: create_token_store(pool_signer, token_2),
            fees_store_1: create_token_store(pool_signer, token_1),
            fees_store_2: create_token_store(pool_signer, token_2),
            lp_token_refs: create_lp_token_refs(pool_constructor_ref),
            swap_fee_bps: if (is_stable) { configs.stable_fee_bps } else { configs.volatile_fee_bps },
            is_stable,
        });
        move_to(pool_signer, FeesAccounting {
            total_fees_1: 0,
            total_fees_2: 0,
            total_fees_at_last_claim_1: smart_table::new(),
            total_fees_at_last_claim_2: smart_table::new(),
            claimable_1: smart_table::new(),
            claimable_2: smart_table::new(),
        });
        let pool = object::convert(lp_token);
        smart_vector::push_back(&mut configs.all_pools, pool);

        event::emit(CreatePool { pool, token_1, token_2, is_stable });
        pool
    }

    /////////////////////////////////////////////////// USERS /////////////////////////////////////////////////////////

    #[view]
    /// Return the amount of tokens received for a swap with the given amount in and the liquidity pool.
    public fun get_amount_out(
        pool: Object<LiquidityPool>,
        from: Object<Metadata>,
        amount_in: u64,
    ): (u64, u64) acquires LiquidityPool {
        let pool_data = liquidity_pool_data(&pool);
        let reserve_1 = (fungible_asset::balance(pool_data.token_store_1) as u256);
        let reserve_2 = (fungible_asset::balance(pool_data.token_store_2) as u256);
        let (reserve_in, reserve_out) = if (from == fungible_asset::store_metadata(pool_data.token_store_1)) {
            (reserve_1, reserve_2)
        } else {
            (reserve_2, reserve_1)
        };
        let fees_amount = math64::mul_div(amount_in, pool_data.swap_fee_bps, FEE_SCALE);
        let amount_in = ((amount_in - fees_amount) as u256);
        let amount_out = if (pool_data.is_stable) {
            let k = calculate_constant_k(pool_data);
            reserve_out - get_y(amount_in + reserve_in, k, reserve_out)
        } else {
            amount_in * reserve_out / (reserve_in + amount_in)
        };
        ((amount_out as u64), fees_amount)
    }

    /// Swaps 'from' for the other token in the pool.
    /// This is friend-only as the returned fungible assets might be of an internal wrapper type. If this is not the
    /// case, this function can be made public.
    public(friend) fun swap(
        pool: Object<LiquidityPool>,
        from: FungibleAsset,
    ): FungibleAsset acquires FeesAccounting, LiquidityPool, LiquidityPoolConfigs {
        assert!(!safe_liquidity_pool_configs().is_paused, ESWAPS_ARE_PAUSED);
        // Calculate the amount of tokens to return to the user and the amount of fees to extract.
        let from_token = fungible_asset::metadata_from_asset(&from);
        let amount_in = fungible_asset::amount(&from);
        let (amount_out, fees_amount) = get_amount_out(pool, from_token, amount_in);
        let fees = fungible_asset::extract(&mut from, fees_amount);

        // Deposits and withdraws.
        let pool_data = liquidity_pool_data(&pool);
        let k_before = calculate_constant_k(pool_data);
        let fees_accounting = unchecked_mut_fees_accounting(&pool);
        let store_1 = pool_data.token_store_1;
        let store_2 = pool_data.token_store_2;
        let swap_signer = &package_manager::get_signer();
        let fees_amount = (fees_amount as u128);
        let out = if (from_token == fungible_asset::store_metadata(pool_data.token_store_1)) {
            // User's swapping token 1 for token 2.
            fungible_asset::deposit(store_1, from);
            fungible_asset::deposit(pool_data.fees_store_1, fees);
            fees_accounting.total_fees_1 = fees_accounting.total_fees_1 + fees_amount;
            fungible_asset::withdraw(swap_signer, store_2, amount_out)
        } else {
            // User's swapping token 2 for token 1.
            fungible_asset::deposit(store_2, from);
            fungible_asset::deposit(pool_data.fees_store_2, fees);
            fees_accounting.total_fees_2 = fees_accounting.total_fees_2 + fees_amount;
            fungible_asset::withdraw(swap_signer, store_1, amount_out)
        };

        let k_after = calculate_constant_k(pool_data);
        assert!(k_before <= k_after, EK_BEFORE_SWAP_GREATER_THAN_EK_AFTER_SWAP);

        event::emit(Swap { pool: object::object_address(&pool), from_token, amount_in }, );
        out
    }

    //////////////////////////////////////// Liquidity Providers (LPs) ///////////////////////////////////////////////

    /// Mint LP tokens for the given liquidity. Note that the LP would receive a smaller amount of LP tokens if the
    /// amounts of liquidity provided are not optimal (do not conform with the constant formula of the pool). Users
    /// should compute the optimal amounts before calling this function.
    public fun mint(
        lp: &signer,
        fungible_asset_1: FungibleAsset,
        fungible_asset_2: FungibleAsset,
        is_stable: bool,
    ) acquires FeesAccounting, LiquidityPool {
        let token_1 = fungible_asset::metadata_from_asset(&fungible_asset_1);
        let token_2 = fungible_asset::metadata_from_asset(&fungible_asset_2);
        if (!is_sorted(token_1, token_2)) {
            return mint(lp, fungible_asset_2, fungible_asset_1, is_stable)
        };
        // The LP store needs to exist before we can mint LP tokens.
        let pool = liquidity_pool(token_1, token_2, is_stable);
        let lp_store = ensure_lp_token_store(signer::address_of(lp), pool);
        let amount_1 = fungible_asset::amount(&fungible_asset_1);
        let amount_2 = fungible_asset::amount(&fungible_asset_2);
        assert!(amount_1 > 0 && amount_2 > 0, EZERO_AMOUNT);
        let pool_data = liquidity_pool_data(&pool);
        let store_1 = pool_data.token_store_1;
        let store_2 = pool_data.token_store_2;

        // Before depositing the added liquidity, compute the amount of LP tokens the LP will receive.
        let reserve_1 = fungible_asset::balance(store_1);
        let reserve_2 = fungible_asset::balance(store_2);
        let lp_token_supply = option::destroy_some(fungible_asset::supply(pool));
        let mint_ref = &pool_data.lp_token_refs.mint_ref;
        let liquidity_token_amount = if (lp_token_supply == 0) {
            let total_liquidity = (math128::sqrt((amount_1 as u128) * (amount_2 as u128)) as u64);
            // Permanently lock the first MINIMUM_LIQUIDITY tokens.
            fungible_asset::mint_to(mint_ref, pool, MINIMUM_LIQUIDITY);
            total_liquidity - MINIMUM_LIQUIDITY
        } else {
            // Only the smaller amount between the token 1 or token 2 is considered. Users should make sure to either
            // use the router module or calculate the optimal amounts to provide before calling this function.
            let token_1_liquidity = math64::mul_div(amount_1, (lp_token_supply as u64), reserve_1);
            let token_2_liquidity = math64::mul_div(amount_2, (lp_token_supply as u64), reserve_2);
            math64::min(token_1_liquidity, token_2_liquidity)
        };
        assert!(liquidity_token_amount > 0, EINSUFFICIENT_LIQUIDITY_MINTED);

        // Deposit the received liquidity into the pool.
        fungible_asset::deposit(store_1, fungible_asset_1);
        fungible_asset::deposit(store_2, fungible_asset_2);

        // We need to update the amount of rewards claimable by this LP token store if they already have a previous
        // balance. This ensures that their update balance would not lead to earning a larger portion of the fees
        // retroactively.
        update_claimable_fees(signer::address_of(lp), pool);

        // Mint the corresponding amount of LP tokens to the LP.
        let lp_tokens = fungible_asset::mint(mint_ref, liquidity_token_amount);
        fungible_asset::deposit_with_ref(&pool_data.lp_token_refs.transfer_ref, lp_store, lp_tokens);
    }

    /// Transfer a given amount of LP tokens from the sender to the receiver. This must be called for all transfers as
    /// fungible_asset::transfer or primary_fungible_store::transfer would not work for LP tokens.
    public entry fun transfer(
        from: &signer,
        lp_token: Object<LiquidityPool>,
        to: address,
        amount: u64,
    ) acquires FeesAccounting, LiquidityPool {
        assert!(amount > 0, EZERO_AMOUNT);
        let from_address = signer::address_of(from);
        let from_store = ensure_lp_token_store(from_address, lp_token);
        let to_store = ensure_lp_token_store(to, lp_token);

        // Update the claimable amounts for both the sender and receiver before transferring.
        update_claimable_fees(from_address, lp_token);
        update_claimable_fees(to, lp_token);

        let transfer_ref = &liquidity_pool_data(&lp_token).lp_token_refs.transfer_ref;
        fungible_asset::transfer_with_ref(transfer_ref, from_store, to_store, amount);
    }

    /// Burn the given amount of LP tokens and receive the underlying liquidity.
    /// This is friend-only as the returned fungible assets might be of an internal wrapper type. If this is not the
    /// case, this function can be made public.
    public(friend) fun burn(
        lp: &signer,
        token_1: Object<Metadata>,
        token_2: Object<Metadata>,
        is_stable: bool,
        amount: u64,
    ): (FungibleAsset, FungibleAsset) acquires FeesAccounting, LiquidityPool {
        assert!(amount > 0, EZERO_AMOUNT);
        let lp_address = signer::address_of(lp);
        let pool = liquidity_pool(token_1, token_2, is_stable);
        let store = ensure_lp_token_store(lp_address, pool);

        // We need to update the amount of rewards claimable by this LP token store if they already have a previous
        // balance. This ensures that they can get the unclaimed fees they're entitled to before burning.
        update_claimable_fees(lp_address, pool);

        // Burn the provided LP tokens.
        let lp_token_supply = option::destroy_some(fungible_asset::supply(pool));
        let pool_data = liquidity_pool_data(&pool);
        fungible_asset::burn_from(&pool_data.lp_token_refs.burn_ref, store, amount);

        // Calculate the amounts of tokens redeemed from the pool.
        let store_1 = pool_data.token_store_1;
        let store_2 = pool_data.token_store_2;
        let reserve_1 = fungible_asset::balance(store_1);
        let reserve_2 = fungible_asset::balance(store_2);
        let amount_to_redeem_1 = (math128::mul_div(
            (amount as u128),
            (reserve_1 as u128),
            lp_token_supply
        ) as u64);
        let amount_to_redeem_2 = (math128::mul_div(
            (amount as u128),
            (reserve_2 as u128),
            lp_token_supply
        ) as u64);
        assert!(amount_to_redeem_1 > 0 && amount_to_redeem_2 > 0, EINSUFFICIENT_LIQUIDITY_REDEEMED);

        // Withdraw and return the redeemed tokens.
        let swap_signer = &package_manager::get_signer();
        let redeemed_1 = fungible_asset::withdraw(swap_signer, store_1, amount_to_redeem_1);
        let redeemed_2 = fungible_asset::withdraw(swap_signer, store_2, amount_to_redeem_2);
        if (is_sorted(token_1, token_2)) {
            (redeemed_1, redeemed_2)
        } else {
            (redeemed_2, redeemed_1)
        }
    }

    /// Calculate and update the latest amount of fees claimable by the given LP.
    public entry fun update_claimable_fees(lp: address, pool: Object<LiquidityPool>) acquires FeesAccounting {
        let fees_accounting = unchecked_mut_fees_accounting(&pool);
        let current_total_fees_1 = fees_accounting.total_fees_1;
        let current_total_fees_2 = fees_accounting.total_fees_2;
        let lp_balance = (primary_fungible_store::balance(lp, pool) as u128);
        let lp_token_total_supply = lp_token_supply(pool);
        // Calculate and update the amount of fees this LP token store is entitled to, taking into account the last
        // time they claimed.
        if (lp_balance > 0) {
            let last_total_fees_1 = *smart_table::borrow(&fees_accounting.total_fees_at_last_claim_1, lp);
            let last_total_fees_2 = *smart_table::borrow(&fees_accounting.total_fees_at_last_claim_2, lp);
            let delta_1 = current_total_fees_1 - last_total_fees_1;
            let delta_2 = current_total_fees_2 - last_total_fees_2;
            let claimable_1 = math128::mul_div(delta_1, lp_balance, lp_token_total_supply);
            let claimable_2 = math128::mul_div(delta_2, lp_balance, lp_token_total_supply);
            if (claimable_1 > 0) {
                let old_claimable_1 = smart_table::borrow_mut_with_default(&mut fees_accounting.claimable_1, lp, 0);
                *old_claimable_1 = *old_claimable_1 + claimable_1;
            };
            if (claimable_2 > 0) {
                let old_claimable_2 = smart_table::borrow_mut_with_default(&mut fees_accounting.claimable_2, lp, 0);
                *old_claimable_2 = *old_claimable_2 + claimable_2;
            };
        };

        smart_table::upsert(&mut fees_accounting.total_fees_at_last_claim_1, lp, current_total_fees_1);
        smart_table::upsert(&mut fees_accounting.total_fees_at_last_claim_2, lp, current_total_fees_2);
    }

    /// Claim the fees that the given LP is entitled to.
    /// This is friend-only as the returned fungible assets might be of an internal wrapper type. If this is not the
    /// case, this function can be made public.
    public(friend) fun claim_fees(
        lp: &signer,
        pool: Object<LiquidityPool>,
    ): (FungibleAsset, FungibleAsset) acquires FeesAccounting, LiquidityPool {
        let lp_address = signer::address_of(lp);
        update_claimable_fees(lp_address, pool);

        let pool_data = liquidity_pool_data(&pool);
        let fees_accounting = unchecked_mut_fees_accounting(&pool);
        let claimable_1 = if (smart_table::contains(&fees_accounting.claimable_1, lp_address)) {
            smart_table::remove(&mut fees_accounting.claimable_1, lp_address)
        } else {
            0
        };
        let claimable_2 = if (smart_table::contains(&fees_accounting.claimable_2, lp_address)) {
            smart_table::remove(&mut fees_accounting.claimable_2, lp_address)
        } else {
            0
        };
        let swap_signer = &package_manager::get_signer();
        let fees_1 = if (claimable_1 > 0) {
            fungible_asset::withdraw(swap_signer, pool_data.fees_store_1, (claimable_1 as u64))
        } else {
            fungible_asset::zero(fungible_asset::store_metadata(pool_data.fees_store_1))
        };
        let fees_2 = if (claimable_2 > 0) {
            fungible_asset::withdraw(swap_signer, pool_data.fees_store_2, (claimable_2 as u64))
        } else {
            fungible_asset::zero(fungible_asset::store_metadata(pool_data.fees_store_2))
        };
        (fees_1, fees_2)
    }

    /////////////////////////////////////////////////// OPERATIONS /////////////////////////////////////////////////////

    public entry fun set_pauser(pauser: &signer, new_pauser: address) acquires LiquidityPoolConfigs {
        let pool_configs = pauser_only_mut_liquidity_pool_configs(pauser);
        pool_configs.pending_pauser = new_pauser;
    }

    public entry fun accept_pauser(new_pauser: &signer) acquires LiquidityPoolConfigs {
        let pool_configs = unchecked_mut_liquidity_pool_configs();
        assert!(signer::address_of(new_pauser) == pool_configs.pending_pauser, ENOT_AUTHORIZED);
        pool_configs.pauser = pool_configs.pending_pauser;
        pool_configs.pending_pauser = @0x0;
    }

    public entry fun set_pause(pauser: &signer, is_paused: bool) acquires LiquidityPoolConfigs {
        let pool_configs = pauser_only_mut_liquidity_pool_configs(pauser);
        pool_configs.is_paused = is_paused;
    }

    public entry fun set_fee_manager(fee_manager: &signer, new_fee_manager: address) acquires LiquidityPoolConfigs {
        let pool_configs = fee_manager_only_mut_liquidity_pool_configs(fee_manager);
        pool_configs.pending_fee_manager = new_fee_manager;
    }

    public entry fun accept_fee_manager(new_fee_manager: &signer) acquires LiquidityPoolConfigs {
        let pool_configs = unchecked_mut_liquidity_pool_configs();
        assert!(signer::address_of(new_fee_manager) == pool_configs.pending_fee_manager, ENOT_AUTHORIZED);
        pool_configs.fee_manager = pool_configs.pending_fee_manager;
        pool_configs.pending_fee_manager = @0x0;
    }

    public entry fun set_stable_fee(fee_manager: &signer, new_fee_bps: u64) acquires LiquidityPoolConfigs {
        let pool_configs = fee_manager_only_mut_liquidity_pool_configs(fee_manager);
        pool_configs.stable_fee_bps = new_fee_bps;
    }

    public entry fun set_volatile_fee(fee_manager: &signer, new_fee_bps: u64) acquires LiquidityPoolConfigs {
        let pool_configs = fee_manager_only_mut_liquidity_pool_configs(fee_manager);
        pool_configs.volatile_fee_bps = new_fee_bps;
    }

    inline fun create_lp_token(
        token_1: Object<Metadata>,
        token_2: Object<Metadata>,
        is_stable: bool,
    ): &ConstructorRef {
        let token_name = lp_token_name(token_1, token_2);
        let seeds = get_pool_seeds(token_1, token_2, is_stable);
        let lp_token_constructor_ref = &object::create_named_object(&package_manager::get_signer(), seeds);
        // We don't enable automatic primary store creation because we need LPs to call into this module for transfers
        // so the fees accounting can be updated correctly.
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            lp_token_constructor_ref,
            option::none(),
            token_name,
            string::utf8(b"LP"),
            LP_TOKEN_DECIMALS,
            string::utf8(b""),
            string::utf8(b"")
        );
        lp_token_constructor_ref
    }

    fun create_lp_token_refs(constructor_ref: &ConstructorRef): LPTokenRefs {
        LPTokenRefs {
            burn_ref: fungible_asset::generate_burn_ref(constructor_ref),
            mint_ref: fungible_asset::generate_mint_ref(constructor_ref),
            transfer_ref: fungible_asset::generate_transfer_ref(constructor_ref),
        }
    }

    fun ensure_lp_token_store<T: key>(lp: address, pool: Object<T>): Object<FungibleStore> acquires LiquidityPool {
        primary_fungible_store::ensure_primary_store_exists(lp, pool);
        let store = primary_fungible_store::primary_store(lp, pool);
        if (!fungible_asset::is_frozen(store)) {
            // LPs must call transfer here to transfer the LP tokens so claimable fees can be updated correctly.
            let transfer_ref = &liquidity_pool_data(&pool).lp_token_refs.transfer_ref;
            fungible_asset::set_frozen_flag(transfer_ref, store, true);
        };
        store
    }

    inline fun get_pool_seeds(token_1: Object<Metadata>, token_2: Object<Metadata>, is_stable: bool): vector<u8> {
        let seeds = vector[];
        vector::append(&mut seeds, bcs::to_bytes(&object::object_address(&token_1)));
        vector::append(&mut seeds, bcs::to_bytes(&object::object_address(&token_2)));
        vector::append(&mut seeds, bcs::to_bytes(&is_stable));
        seeds
    }

    inline fun create_token_store(pool_signer: &signer, token: Object<Metadata>): Object<FungibleStore> {
        let constructor_ref = &object::create_object_from_object(pool_signer);
        fungible_asset::create_store(constructor_ref, token)
    }

    inline fun lp_token_name(token_1: Object<Metadata>, token_2: Object<Metadata>): String {
        let token_symbol = string::utf8(b"LP-");
        string::append(&mut token_symbol, fungible_asset::symbol(token_1));
        string::append_utf8(&mut token_symbol, b"-");
        string::append(&mut token_symbol, fungible_asset::symbol(token_2));
        token_symbol
    }

    inline fun calculate_constant_k(pool: &LiquidityPool): u256 {
        let r1 = (fungible_asset::balance(pool.token_store_1) as u256);
        let r2 = (fungible_asset::balance(pool.token_store_2) as u256);
        if (pool.is_stable) {
            // k = x^3 * y + y^3 * x. This is a modified constant for stable pairs.
            r1 * r1 * r1 * r2 + r2 * r2 * r2 * r1
        } else {
            // k = x * y. This is standard constant product for volatile asset pairs.
            r1 * r2
        }
    }

    inline fun safe_fees_accounting<T: key>(pool: &Object<T>): &FeesAccounting acquires FeesAccounting {
        borrow_global<FeesAccounting>(object::object_address(pool))
    }

    inline fun liquidity_pool_data<T: key>(pool: &Object<T>): &LiquidityPool acquires LiquidityPool {
        borrow_global<LiquidityPool>(object::object_address(pool))
    }

    inline fun safe_liquidity_pool_configs(): &LiquidityPoolConfigs acquires LiquidityPoolConfigs {
        borrow_global<LiquidityPoolConfigs>(@swap)
    }

    inline fun pauser_only_mut_liquidity_pool_configs(
        pauser: &signer,
    ): &mut LiquidityPoolConfigs acquires LiquidityPoolConfigs {
        let pool_configs = unchecked_mut_liquidity_pool_configs();
        assert!(signer::address_of(pauser) == pool_configs.pauser, ENOT_AUTHORIZED);
        pool_configs
    }

    inline fun fee_manager_only_mut_liquidity_pool_configs(
        fee_manager: &signer,
    ): &mut LiquidityPoolConfigs acquires LiquidityPoolConfigs {
        let pool_configs = unchecked_mut_liquidity_pool_configs();
        assert!(signer::address_of(fee_manager) == pool_configs.fee_manager, ENOT_AUTHORIZED);
        pool_configs
    }

    inline fun unchecked_mut_liquidity_pool_data<T: key>(pool: &Object<T>): &mut LiquidityPool acquires LiquidityPool {
        borrow_global_mut<LiquidityPool>(object::object_address(pool))
    }

    inline fun unchecked_mut_fees_accounting<T: key>(pool: &Object<T>): &mut FeesAccounting acquires FeesAccounting {
        borrow_global_mut<FeesAccounting>(object::object_address(pool))
    }

    inline fun unchecked_mut_liquidity_pool_configs(): &mut LiquidityPoolConfigs acquires LiquidityPoolConfigs {
        borrow_global_mut<LiquidityPoolConfigs>(@swap)
    }

    inline fun f(x0: u256, y: u256): u256 {
        x0 * (y * y * y) + (x0 * x0 * x0) * y
    }

    inline fun d(x0: u256, y: u256): u256 {
        3 * x0 * (y * y) + (x0 * x0 * x0)
    }

    fun get_y(x0: u256, xy: u256, y: u256): u256 {
        let i = 0;
        while (i < 255) {
            let y_prev = y;
            let k = f(x0, y);
            if (k < xy) {
                let dy = (xy - k) / d(x0, y);
                y = y + dy;
            } else {
                let dy = (k - xy) / d(x0, y);
                y = y - dy;
            };
            if (y > y_prev) {
                if (y - y_prev <= 1) {
                    return y
                }
            } else {
                if (y_prev - y <= 1) {
                    return y
                }
            };
            i = i + 1;
        };
        y
    }

    #[test_only]
    friend swap::liquidity_pool_tests;
}
\`\`\`

When refining the code, make sure to:
- Make all structs and functions complete with proper implementation
- Add comprehensive error handling with descriptive error codes
- Include inline documentation for important functions and structs
- Optimize for gas efficiency
- Complete any unfinished or placeholder logic
- Add security checks to prevent common vulnerabilities

IMPORTANT: Return ONLY a JSON object with a single field called "code" containing the refined Move code as a string.
Format your response exactly as follows: {"code": "module example::refined { ... }"}
`;

/**
 * Refines the generated Move code using the Gemini API
 * @param composition The composition data
 * @param primitives The primitives used in the composition
 * @param generatedCode The initial generated code
 * @returns The refined Move code
 */
export async function refineGeneratedCode(
  composition: any, // Using any to avoid interface mismatch issues
  primitives: Record<string, IPrimitive>,
  generatedCode: string
): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found. Skipping code refinement.');
      return generatedCode;
    }

    // Get the model
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: SYSTEM_PROMPT,
    });

    // Format primitives data for better understanding by the model
    const primitivesData = Object.values(primitives).map(primitive => {
      return {
        id: primitive.id,
        name: primitive.name,
        category: primitive.category,
        moduleAddress: primitive.moduleAddress,
        moduleName: primitive.moduleName,
        functions: primitive.functions,
        source: primitive.source || 'Source code not available'
      };
    });

    // Prepare the prompt with comprehensive data about the composition
    const prompt = `
    Please refine the following Move code for an Aptos DeFi composition:
    
    COMPOSITION TITLE:
    ${composition.name}
    
    COMPOSITION DESCRIPTION:
    ${composition.description}
    
    PRIMITIVES USED (${Object.keys(primitives).length}):
    ${JSON.stringify(primitivesData, null, 2)}
    
    COMPOSITION DATA:
    ${JSON.stringify({
      id: composition.id,
      connections: composition.connections,
      status: composition.status
    }, null, 2)}
    
    GENERATED CODE:
    \`\`\`move
    ${generatedCode}
    \`\`\`
    
    Please refine this code to ensure it's optimized, secure, and ready for deployment without any compilation or runtime errors. 
    
    INSTRUCTIONS FOR OUTPUT FORMAT:
    Return ONLY a JSON object with a single field called "code" containing the complete refined Move code as a string. 
    Do not include any explanations, markdown formatting, or additional text outside the JSON object.
    
    Example response format:
    {"code": "module example::refined_module { ... }"}`;

    // Generate refined code
    console.log('Sending code to Gemini for refinement...');
    const response = await model.generateContent(prompt);
    
    // Extract code from response
    let refinedCode = response.response.text();
    
    // Clean up the response to get only the code
    refinedCode = extractCodeFromJsonOrMarkdown(refinedCode);
    
    console.log('Code refinement complete.');
    return refinedCode;
  } catch (error) {
    console.error('Error refining code with Gemini:', error);
    // Return the original code if refinement fails
    return generatedCode;
  }
}

/**
 * Helper function to extract code from JSON or markdown formatted text
 */
function extractCodeFromJsonOrMarkdown(text: string): string {
  try {
    // First, try to parse as JSON
    const trimmedText = text.trim();
    const jsonObject = JSON.parse(trimmedText);
    
    // If it's a valid JSON with a code property, return the code
    if (jsonObject && typeof jsonObject.code === 'string') {
      return jsonObject.code.trim();
    }
  } catch (e) {
    // If JSON parsing fails, try extracting from markdown
    console.log('Response was not valid JSON, attempting to extract code from markdown...');
  }
  
  // Extract content between ```move and ``` tags
  const moveCodeRegex = /```move\s*([\s\S]*?)\s*```/;
  const codeMatch = text.match(moveCodeRegex);
  
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1].trim();
  }
  
  // If no ```move tag, try generic code block
  const genericCodeRegex = /```\s*([\s\S]*?)\s*```/;
  const genericMatch = text.match(genericCodeRegex);
  
  if (genericMatch && genericMatch[1]) {
    return genericMatch[1].trim();
  }
  
  // If no code blocks found, return the original text
  return text;
} 