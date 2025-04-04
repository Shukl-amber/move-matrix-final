module defi_matrix::swap_primitive {
    use std::error;
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_std::table::{Self, Table};
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    
    /// Error codes
    const EINSUFFICIENT_BALANCE: u64 = 1;
    const EINSUFFICIENT_LIQUIDITY: u64 = 2;
    const EZERO_AMOUNT: u64 = 3;
    const EPOOL_NOT_FOUND: u64 = 4;
    const EZERO_LIQUIDITY: u64 = 5;
    const EPOOL_EXISTS: u64 = 6;
    const ECOIN_TYPE_SAME: u64 = 7;
    const ESLIPPAGE_TOO_HIGH: u64 = 8;
    
    /// Represents a swap pool for a pair of coins
    struct SwapPool<phantom CoinTypeX, phantom CoinTypeY> has key {
        /// Reserve of CoinTypeX
        reserve_x: u64,
        /// Reserve of CoinTypeY
        reserve_y: u64,
        /// Last update timestamp
        last_update_time: u64,
        /// Swap fee in basis points (e.g., 30 = 0.3%)
        fee_bps: u64,
        /// LP tokens issued to liquidity providers
        lp_shares: Table<address, u64>,
        /// Total LP tokens issued
        total_lp_shares: u64,
        /// Events
        swap_events: EventHandle<SwapEvent>,
        add_liquidity_events: EventHandle<AddLiquidityEvent>,
        remove_liquidity_events: EventHandle<RemoveLiquidityEvent>,
    }
    
    /// Events
    struct SwapEvent has drop, store {
        user: address,
        coin_in_type: bool, // true for X, false for Y
        amount_in: u64,
        amount_out: u64,
        timestamp: u64,
    }
    
    struct AddLiquidityEvent has drop, store {
        user: address,
        amount_x: u64,
        amount_y: u64,
        shares_minted: u64,
        timestamp: u64,
    }
    
    struct RemoveLiquidityEvent has drop, store {
        user: address,
        amount_x: u64,
        amount_y: u64,
        shares_burned: u64,
        timestamp: u64,
    }
    
    /// Initialize a new swap pool for a pair of coins
    public fun initialize_pool<CoinTypeX, CoinTypeY>(
        admin: &signer,
        fee_bps: u64,
    ) {
        // Ensure coin types are not the same
        assert!(
            std::type_info::type_of<CoinTypeX>() != std::type_info::type_of<CoinTypeY>(),
            error::invalid_argument(ECOIN_TYPE_SAME)
        );
        
        // Ensure fee is reasonable (max 5%)
        assert!(fee_bps <= 500, error::invalid_argument(ESLIPPAGE_TOO_HIGH));
        
        // Ensure pool doesn't already exist
        assert!(
            !exists<SwapPool<CoinTypeX, CoinTypeY>>(@defi_matrix) && 
            !exists<SwapPool<CoinTypeY, CoinTypeX>>(@defi_matrix),
            error::already_exists(EPOOL_EXISTS)
        );
        
        // Create a new swap pool
        let pool = SwapPool<CoinTypeX, CoinTypeY> {
            reserve_x: 0,
            reserve_y: 0,
            last_update_time: timestamp::now_seconds(),
            fee_bps,
            lp_shares: table::new(),
            total_lp_shares: 0,
            swap_events: event::new_event_handle<SwapEvent>(admin),
            add_liquidity_events: event::new_event_handle<AddLiquidityEvent>(admin),
            remove_liquidity_events: event::new_event_handle<RemoveLiquidityEvent>(admin),
        };
        
        // Save the pool to global storage
        move_to(admin, pool);
    }
    
    /// Add liquidity to the pool
    public fun add_liquidity<CoinTypeX, CoinTypeY>(
        user: &signer,
        amount_x: u64,
        amount_y: u64,
    ) acquires SwapPool {
        let user_addr = signer::address_of(user);
        
        // Check that amounts are not zero
        assert!(amount_x > 0 && amount_y > 0, error::invalid_argument(EZERO_AMOUNT));
        
        // Get the swap pool
        let pool = borrow_global_mut<SwapPool<CoinTypeX, CoinTypeY>>(@defi_matrix);
        
        // Withdraw coins from the user's account and add to the pool
        let coins_x = coin::withdraw<CoinTypeX>(user, amount_x);
        let coins_y = coin::withdraw<CoinTypeY>(user, amount_y);
        
        // Calculate shares to mint
        let shares_to_mint: u64;
        if (pool.total_lp_shares == 0) {
            // For the first liquidity provider, we mint sqrt(amount_x * amount_y) shares
            shares_to_mint = (amount_x as u128 * amount_y as u128) ^ (1/2) as u64;
            // Alternatively, we could use a simpler formula for the first deposit
            // shares_to_mint = (amount_x * amount_y) / 1000;
        } else {
            // For subsequent liquidity providers, we maintain the ratio of reserves
            let shares_from_x = (amount_x as u128 * pool.total_lp_shares as u128) / pool.reserve_x as u128;
            let shares_from_y = (amount_y as u128 * pool.total_lp_shares as u128) / pool.reserve_y as u128;
            
            // Take the minimum to ensure proper ratio
            shares_to_mint = if (shares_from_x < shares_from_y) {
                shares_from_x as u64
            } else {
                shares_from_y as u64
            };
        };
        
        // Ensure non-zero shares
        assert!(shares_to_mint > 0, error::invalid_state(EZERO_LIQUIDITY));
        
        // Update user's LP shares
        if (!table::contains(&pool.lp_shares, user_addr)) {
            table::add(&mut pool.lp_shares, user_addr, shares_to_mint);
        } else {
            let user_shares = table::borrow_mut(&mut pool.lp_shares, user_addr);
            *user_shares = *user_shares + shares_to_mint;
        };
        
        // Update pool state
        pool.reserve_x = pool.reserve_x + amount_x;
        pool.reserve_y = pool.reserve_y + amount_y;
        pool.total_lp_shares = pool.total_lp_shares + shares_to_mint;
        pool.last_update_time = timestamp::now_seconds();
        
        // Emit add liquidity event
        event::emit_event(
            &mut pool.add_liquidity_events,
            AddLiquidityEvent {
                user: user_addr,
                amount_x,
                amount_y,
                shares_minted: shares_to_mint,
                timestamp: timestamp::now_seconds(),
            },
        );
        
        // Destroy the coins (they're now tracked in the pool)
        coin::destroy_zero(coins_x);
        coin::destroy_zero(coins_y);
    }
    
    /// Remove liquidity from the pool
    public fun remove_liquidity<CoinTypeX, CoinTypeY>(
        user: &signer,
        shares_to_burn: u64,
    ) acquires SwapPool {
        let user_addr = signer::address_of(user);
        
        // Check that amount is not zero
        assert!(shares_to_burn > 0, error::invalid_argument(EZERO_AMOUNT));
        
        // Get the swap pool
        let pool = borrow_global_mut<SwapPool<CoinTypeX, CoinTypeY>>(@defi_matrix);
        
        // Check if user has enough shares
        assert!(
            table::contains(&pool.lp_shares, user_addr),
            error::not_found(EPOOL_NOT_FOUND)
        );
        
        let user_shares = table::borrow_mut(&mut pool.lp_shares, user_addr);
        assert!(*user_shares >= shares_to_burn, error::invalid_argument(EINSUFFICIENT_BALANCE));
        
        // Calculate amount of each token to return
        let amount_x = (shares_to_burn as u128 * pool.reserve_x as u128) / pool.total_lp_shares as u128;
        let amount_y = (shares_to_burn as u128 * pool.reserve_y as u128) / pool.total_lp_shares as u128;
        
        // Update user's LP shares
        *user_shares = *user_shares - shares_to_burn;
        
        // Update pool state
        pool.reserve_x = pool.reserve_x - (amount_x as u64);
        pool.reserve_y = pool.reserve_y - (amount_y as u64);
        pool.total_lp_shares = pool.total_lp_shares - shares_to_burn;
        pool.last_update_time = timestamp::now_seconds();
        
        // Transfer tokens back to the user
        let coins_x = coin::withdraw<CoinTypeX>(&@defi_matrix, amount_x as u64);
        let coins_y = coin::withdraw<CoinTypeY>(&@defi_matrix, amount_y as u64);
        coin::deposit(user_addr, coins_x);
        coin::deposit(user_addr, coins_y);
        
        // Emit remove liquidity event
        event::emit_event(
            &mut pool.remove_liquidity_events,
            RemoveLiquidityEvent {
                user: user_addr,
                amount_x: amount_x as u64,
                amount_y: amount_y as u64,
                shares_burned: shares_to_burn,
                timestamp: timestamp::now_seconds(),
            },
        );
    }
    
    /// Swap X for Y
    public fun swap_x_for_y<CoinTypeX, CoinTypeY>(
        user: &signer,
        amount_in: u64,
        min_amount_out: u64,
    ) acquires SwapPool {
        let user_addr = signer::address_of(user);
        
        // Check that amount is not zero
        assert!(amount_in > 0, error::invalid_argument(EZERO_AMOUNT));
        
        // Get the swap pool
        let pool = borrow_global_mut<SwapPool<CoinTypeX, CoinTypeY>>(@defi_matrix);
        
        // Check pool has liquidity
        assert!(
            pool.reserve_x > 0 && pool.reserve_y > 0,
            error::invalid_state(EINSUFFICIENT_LIQUIDITY)
        );
        
        // Calculate the amount out using the constant product formula: (x * y = k)
        // amount_out = (reserve_y * amount_in) / (reserve_x + amount_in)
        // Applying the fee: amount_in * (10000 - fee_bps) / 10000
        let amount_in_with_fee = (amount_in as u128 * (10000 - pool.fee_bps as u128)) / 10000;
        let numerator = amount_in_with_fee * pool.reserve_y as u128;
        let denominator = pool.reserve_x as u128 + amount_in_with_fee;
        let amount_out = numerator / denominator;
        
        // Check for slippage
        assert!(
            amount_out >= min_amount_out as u128,
            error::invalid_state(ESLIPPAGE_TOO_HIGH)
        );
        
        // Check liquidity is sufficient
        assert!(
            amount_out <= pool.reserve_y as u128,
            error::invalid_state(EINSUFFICIENT_LIQUIDITY)
        );
        
        // Withdraw coins from the user's account and swap
        let coins_in = coin::withdraw<CoinTypeX>(user, amount_in);
        
        // Update pool state
        pool.reserve_x = pool.reserve_x + amount_in;
        pool.reserve_y = pool.reserve_y - (amount_out as u64);
        pool.last_update_time = timestamp::now_seconds();
        
        // Transfer tokens to the user
        let coins_out = coin::withdraw<CoinTypeY>(&@defi_matrix, amount_out as u64);
        coin::deposit(user_addr, coins_out);
        
        // Emit swap event
        event::emit_event(
            &mut pool.swap_events,
            SwapEvent {
                user: user_addr,
                coin_in_type: true, // X -> Y
                amount_in,
                amount_out: amount_out as u64,
                timestamp: timestamp::now_seconds(),
            },
        );
        
        // Destroy the coins (they're now tracked in the pool)
        coin::destroy_zero(coins_in);
    }
    
    /// Swap Y for X
    public fun swap_y_for_x<CoinTypeX, CoinTypeY>(
        user: &signer,
        amount_in: u64,
        min_amount_out: u64,
    ) acquires SwapPool {
        let user_addr = signer::address_of(user);
        
        // Check that amount is not zero
        assert!(amount_in > 0, error::invalid_argument(EZERO_AMOUNT));
        
        // Get the swap pool
        let pool = borrow_global_mut<SwapPool<CoinTypeX, CoinTypeY>>(@defi_matrix);
        
        // Check pool has liquidity
        assert!(
            pool.reserve_x > 0 && pool.reserve_y > 0,
            error::invalid_state(EINSUFFICIENT_LIQUIDITY)
        );
        
        // Calculate the amount out using the constant product formula: (x * y = k)
        // amount_out = (reserve_x * amount_in) / (reserve_y + amount_in)
        // Applying the fee: amount_in * (10000 - fee_bps) / 10000
        let amount_in_with_fee = (amount_in as u128 * (10000 - pool.fee_bps as u128)) / 10000;
        let numerator = amount_in_with_fee * pool.reserve_x as u128;
        let denominator = pool.reserve_y as u128 + amount_in_with_fee;
        let amount_out = numerator / denominator;
        
        // Check for slippage
        assert!(
            amount_out >= min_amount_out as u128,
            error::invalid_state(ESLIPPAGE_TOO_HIGH)
        );
        
        // Check liquidity is sufficient
        assert!(
            amount_out <= pool.reserve_x as u128,
            error::invalid_state(EINSUFFICIENT_LIQUIDITY)
        );
        
        // Withdraw coins from the user's account and swap
        let coins_in = coin::withdraw<CoinTypeY>(user, amount_in);
        
        // Update pool state
        pool.reserve_y = pool.reserve_y + amount_in;
        pool.reserve_x = pool.reserve_x - (amount_out as u64);
        pool.last_update_time = timestamp::now_seconds();
        
        // Transfer tokens to the user
        let coins_out = coin::withdraw<CoinTypeX>(&@defi_matrix, amount_out as u64);
        coin::deposit(user_addr, coins_out);
        
        // Emit swap event
        event::emit_event(
            &mut pool.swap_events,
            SwapEvent {
                user: user_addr,
                coin_in_type: false, // Y -> X
                amount_in,
                amount_out: amount_out as u64,
                timestamp: timestamp::now_seconds(),
            },
        );
        
        // Destroy the coins (they're now tracked in the pool)
        coin::destroy_zero(coins_in);
    }
    
    /// Quote exact output amount for X to Y swap
    public fun get_amount_out_x_to_y<CoinTypeX, CoinTypeY>(amount_in: u64): u64 acquires SwapPool {
        let pool = borrow_global<SwapPool<CoinTypeX, CoinTypeY>>(@defi_matrix);
        
        if (pool.reserve_x == 0 || pool.reserve_y == 0) {
            return 0
        };
        
        let amount_in_with_fee = (amount_in as u128 * (10000 - pool.fee_bps as u128)) / 10000;
        let numerator = amount_in_with_fee * pool.reserve_y as u128;
        let denominator = pool.reserve_x as u128 + amount_in_with_fee;
        (numerator / denominator) as u64
    }
    
    /// Quote exact output amount for Y to X swap
    public fun get_amount_out_y_to_x<CoinTypeX, CoinTypeY>(amount_in: u64): u64 acquires SwapPool {
        let pool = borrow_global<SwapPool<CoinTypeX, CoinTypeY>>(@defi_matrix);
        
        if (pool.reserve_x == 0 || pool.reserve_y == 0) {
            return 0
        };
        
        let amount_in_with_fee = (amount_in as u128 * (10000 - pool.fee_bps as u128)) / 10000;
        let numerator = amount_in_with_fee * pool.reserve_x as u128;
        let denominator = pool.reserve_y as u128 + amount_in_with_fee;
        (numerator / denominator) as u64
    }
    
    /// Get user's LP shares
    public fun get_user_lp_shares<CoinTypeX, CoinTypeY>(user_addr: address): u64 acquires SwapPool {
        let pool = borrow_global<SwapPool<CoinTypeX, CoinTypeY>>(@defi_matrix);
        
        if (!table::contains(&pool.lp_shares, user_addr)) {
            return 0
        };
        
        *table::borrow(&pool.lp_shares, user_addr)
    }
    
    /// Get pool reserves
    public fun get_reserves<CoinTypeX, CoinTypeY>(): (u64, u64) acquires SwapPool {
        let pool = borrow_global<SwapPool<CoinTypeX, CoinTypeY>>(@defi_matrix);
        (pool.reserve_x, pool.reserve_y)
    }
    
    /// Get total LP shares
    public fun get_total_lp_shares<CoinTypeX, CoinTypeY>(): u64 acquires SwapPool {
        let pool = borrow_global<SwapPool<CoinTypeX, CoinTypeY>>(@defi_matrix);
        pool.total_lp_shares
    }
} 