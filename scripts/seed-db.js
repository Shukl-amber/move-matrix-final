// Direct MongoDB seeding script 
// This avoids TypeScript issues and doesn't rely on the Next.js API routes

const { MongoClient } = require('mongodb');

// Use the MongoDB URI from environment variable or hardcoded fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://suyogp0607:prVJc7eQNK53J69D@cluster0.t7m4spr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connection URL
const url = MONGODB_URI;
const client = new MongoClient(url);

// Database Name
const dbName = 'movematrix';

// Sample primitives to seed
const mockPrimitives = [
  {
    id: "primitive-1",
    name: "Lending Protocol",
    category: "lending",
    description: "A primitive for lending and borrowing assets with interest accrual",
    author: "MoveMatrix",
    moduleAddress: "0x1",
    moduleName: "lending_protocol",
    functions: [
      {
        name: "deposit",
        description: "Deposit assets into the lending pool",
        parameters: ["amount", "account"],
        returnType: "bool"
      },
      {
        name: "withdraw",
        description: "Withdraw assets from the lending pool",
        parameters: ["amount", "account"],
        returnType: "bool"
      },
      {
        name: "borrow",
        description: "Borrow assets from the lending pool using collateral",
        parameters: ["amount", "account", "collateral_amount"],
        returnType: "u64"
      },
      {
        name: "repay",
        description: "Repay borrowed assets",
        parameters: ["amount", "account"],
        returnType: "bool"
      }
    ],
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2023-06-20"),
    deploymentAddress: "0x1",
    source: `
module lending_protocol {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::account;
    
    /// Lending pool resource stored at the protocol address
    struct LendingPool<phantom CoinType> has key {
        available_funds: Coin<CoinType>,
        total_borrowed: u64,
        utilization_rate: u64,
        interest_rate: u64,
    }
    
    /// Loan resource stored in a user's account
    struct Loan<phantom CoinType> has key {
        amount: u64,
        collateral: u64,
        interest_rate: u64,
        start_time: u64,
    }
    
    /// Deposit assets into the lending pool
    public fun deposit<CoinType>(
        account: &signer,
        amount: u64
    ): bool {
        let sender = signer::address_of(account);
        // Implementation would transfer coins from user to pool
        // and update pool state
        true
    }
    
    /// Withdraw assets from the lending pool
    public fun withdraw<CoinType>(
        account: &signer,
        amount: u64
    ): bool {
        let sender = signer::address_of(account);
        // Implementation would transfer coins from pool to user
        // and update pool state
        true
    }
    
    /// Borrow assets from the lending pool using collateral
    public fun borrow<CoinType>(
        account: &signer,
        amount: u64,
        collateral_amount: u64
    ): u64 {
        let sender = signer::address_of(account);
        // Implementation would check collateral value
        // and transfer borrowed coins to the user
        
        // Return the actual borrowed amount
        amount
    }
    
    /// Repay borrowed assets
    public fun repay<CoinType>(
        account: &signer,
        amount: u64
    ): bool {
        let sender = signer::address_of(account);
        // Implementation would transfer repayment from user
        // and update loan status
        true
    }
}`
  },
  {
    id: "primitive-2",
    name: "AMM Swap",
    category: "swap",
    description: "Automated market maker for swapping between two tokens",
    author: "MoveMatrix",
    moduleAddress: "0x2",
    moduleName: "amm_swap",
    functions: [
      {
        name: "addLiquidity",
        description: "Add liquidity to the pool",
        parameters: ["amountA", "amountB", "account"],
        returnType: "u64"
      },
      {
        name: "removeLiquidity",
        description: "Remove liquidity from the pool",
        parameters: ["lpAmount", "account"],
        returnType: "bool"
      },
      {
        name: "swapExactTokensForTokens",
        description: "Swap an exact amount of tokens for another token",
        parameters: ["amountIn", "minAmountOut", "account"],
        returnType: "u64"
      }
    ],
    createdAt: new Date("2023-04-10"),
    updatedAt: new Date("2023-05-05"),
    deploymentAddress: "0x2",
    source: `
module amm_swap {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    
    /// Liquidity pool for token pair
    struct LiquidityPool<phantom CoinTypeA, phantom CoinTypeB> has key {
        coin_a: Coin<CoinTypeA>,
        coin_b: Coin<CoinTypeB>,
        lp_supply: u64,
        fee_percent: u64,
    }
    
    /// LP token for pool share
    struct LPToken<phantom CoinTypeA, phantom CoinTypeB> has key {}
    
    /// Add liquidity to the pool
    public fun addLiquidity<CoinTypeA, CoinTypeB>(
        account: &signer,
        amountA: u64,
        amountB: u64
    ): u64 {
        let sender = signer::address_of(account);
        // Implementation would add both tokens to the pool
        // and mint LP tokens to the user
        
        // Return LP tokens minted
        (amountA + amountB) / 2 // Simplified calculation
    }
    
    /// Remove liquidity from the pool
    public fun removeLiquidity<CoinTypeA, CoinTypeB>(
        account: &signer,
        lpAmount: u64
    ): bool {
        let sender = signer::address_of(account);
        // Implementation would burn LP tokens
        // and return both tokens to the user
        true
    }
    
    /// Swap tokens using pool
    public fun swapExactTokensForTokens<CoinTypeIn, CoinTypeOut>(
        account: &signer,
        amountIn: u64,
        minAmountOut: u64
    ): u64 {
        let sender = signer::address_of(account);
        // Implementation would calculate output amount based on
        // constant product formula (x * y = k)
        
        // Apply fees and execute swap
        let out_amount = (amountIn * 98) / 100; // Simple 2% fee
        assert!(out_amount >= minAmountOut, 101);
        
        // Return actual output amount
        out_amount
    }
}`
  },
  {
    id: "liquidity-pool",
    name: "Liquidity Pool",
    description: "A primitive that implements an automated market maker liquidity pool for token pairs.",
    category: "swap",
    moduleAddress: "0x1", 
    moduleName: "liquidity_pool",
    source: `
module liquidity_pool {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::timestamp;
    
    struct LiquidityPool<phantom CoinTypeA, phantom CoinTypeB> has key {
        coin_a: Coin<CoinTypeA>,
        coin_b: Coin<CoinTypeB>,
        lp_supply: u64,
        last_k: u64, // product of balances
    }
    
    // LP Token for liquidity providers
    struct LPToken<phantom CoinTypeA, phantom CoinTypeB> {}
    
    public fun add_liquidity<CoinTypeA, CoinTypeB>(
        account: &signer,
        coin_a_amount: u64,
        coin_b_amount: u64,
        min_lp_tokens: u64
    ): u64 {
        let user_addr = signer::address_of(account);
        
        // Calculate LP tokens to mint based on contribution
        // In a real implementation, this would account for the existing ratio
        let lp_amount = (coin_a_amount + coin_b_amount) / 2; 
        
        // Ensure minimum LP tokens are received
        assert!(lp_amount >= min_lp_tokens, 101);
        
        // Implementation would transfer tokens from user to pool
        // and mint LP tokens to the user
        
        lp_amount
    }
    
    public fun remove_liquidity<CoinTypeA, CoinTypeB>(
        account: &signer,
        lp_amount: u64,
        min_a_out: u64,
        min_b_out: u64
    ): u64 {
        let user_addr = signer::address_of(account);
        
        // Calculate tokens to return based on LP share
        // In a real implementation, this would be proportional to pool holdings
        let total_out = lp_amount * 2; // Simplified return calculation
        let a_out = lp_amount;
        let b_out = lp_amount;
        
        // Ensure minimum amounts are met
        assert!(a_out >= min_a_out, 102);
        assert!(b_out >= min_b_out, 103);
        
        // Implementation would burn LP tokens and return both tokens to user
        
        total_out
    }
    
    public fun swap<CoinTypeA, CoinTypeB>(
        account: &signer,
        coin_in_amount: u64,
        min_out: u64,
        is_a_to_b: bool
    ): u64 {
        let user_addr = signer::address_of(account);
        
        // Calculate output amount based on constant product formula (x * y = k)
        // Apply fees and slippage
        let out_amount = coin_in_amount * 98 / 100; // Simple 2% fee
        
        // Ensure minimum output is met
        assert!(out_amount >= min_out, 104);
        
        // Implementation would transfer input token from user and
        // send output token to user
        
        out_amount
    }
}`,
    functions: [
      {
        name: "add_liquidity",
        description: "Add liquidity to the pool with both tokens",
        parameters: ["coin_a_amount", "coin_b_amount", "min_lp_tokens"],
        returnType: "u64"
      },
      {
        name: "remove_liquidity",
        description: "Remove liquidity from the pool and get back both tokens",
        parameters: ["lp_amount", "min_a_out", "min_b_out"],
        returnType: "u64"
      },
      {
        name: "swap",
        description: "Swap one token for another through the pool",
        parameters: ["coin_in_amount", "min_out", "is_a_to_b"],
        returnType: "u64"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "autocompound-staking",
    name: "AutoCompound Staking",
    description: "A primitive that automatically compounds rewards for staked tokens.",
    category: "staking",
    moduleAddress: "0x1",
    moduleName: "auto_stake",
    source: `
module auto_stake {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::timestamp;
    
    /// Resource to track user's stake
    struct StakeInfo<phantom CoinType> has key {
        staked_amount: u64,
        rewards_accumulated: u64,
        lock_end_time: u64,
        last_compound_time: u64,
    }
    
    /// Global staking pool
    struct StakingPool<phantom CoinType> has key {
        total_staked: u64,
        reward_rate: u64,
        auto_compound_interval: u64,
    }
    
    public fun stake<CoinType>(
        account: &signer,
        amount: u64,
        lock_period: u64
    ): u64 {
        let user_addr = signer::address_of(account);
        let now = timestamp::now_seconds();
        
        // Create or update stake info for user
        if (!exists<StakeInfo<CoinType>>(user_addr)) {
            move_to(account, StakeInfo<CoinType> {
                staked_amount: amount,
                rewards_accumulated: 0,
                lock_end_time: now + lock_period,
                last_compound_time: now,
            });
        } else {
            // Update existing stake
            let stake_info = borrow_global_mut<StakeInfo<CoinType>>(user_addr);
            stake_info.staked_amount = stake_info.staked_amount + amount;
            stake_info.lock_end_time = now + lock_period;
        }
        
        // Implementation would transfer tokens from user to staking pool
        
        // Return the stake ID (using timestamp in this simplified version)
        now
    }
    
    public fun unstake<CoinType>(
        account: &signer,
        amount: u64
    ): u64 {
        let user_addr = signer::address_of(account);
        let now = timestamp::now_seconds();
        
        // Get user's stake info
        let stake_info = borrow_global_mut<StakeInfo<CoinType>>(user_addr);
        
        // Ensure lock period has ended
        assert!(now >= stake_info.lock_end_time, 201);
        
        // Ensure user has enough staked
        assert!(stake_info.staked_amount >= amount, 202);
        
        // Calculate rewards (simplified for example)
        let reward = stake_info.rewards_accumulated;
        
        // Reduce staked amount
        stake_info.staked_amount = stake_info.staked_amount - amount;
        stake_info.rewards_accumulated = 0;
        
        // Implementation would transfer tokens and rewards to user
        
        // Return total amount (staked + rewards)
        amount + reward
    }
    
    public fun compound<CoinType>(): bool {
        // This would be called either automatically or by anyone
        // to compound rewards for all stakers
        
        // Implementation would claim external rewards, swap if needed,
        // and distribute to stakers by increasing their stake balance
        
        true
    }
    
    public fun get_apr<CoinType>(): u64 {
        // Return current APR in basis points (e.g., 1500 = 15%)
        // In a real implementation, this would calculate based on
        // current reward rates and token prices
        1500
    }
}`,
    functions: [
      {
        name: "stake",
        description: "Stake tokens in the autocompounding vault",
        parameters: ["amount", "lock_period"],
        returnType: "u64"
      },
      {
        name: "unstake",
        description: "Unstake tokens and claim accumulated rewards",
        parameters: ["amount"],
        returnType: "u64"
      },
      {
        name: "compound",
        description: "Manually trigger compounding of rewards",
        parameters: [],
        returnType: "bool"
      },
      {
        name: "get_apr",
        description: "Get current annual percentage rate",
        parameters: [],
        returnType: "u64"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "yield-farm",
    name: "Yield Farm",
    description: "A yield farming protocol that distributes rewards based on staked LP tokens",
    category: "staking",
    moduleAddress: "0x3",
    moduleName: "yield_farm",
    source: `
module yield_farm {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::timestamp;
    
    /// User farm position
    struct FarmPosition<phantom StakeToken, phantom RewardToken> has key {
        staked_amount: u64,
        reward_debt: u64,
        last_harvest_time: u64,
    }
    
    /// Farm pool info
    struct Farm<phantom StakeToken, phantom RewardToken> has key {
        total_staked: u64,
        reward_per_second: u64,
        accumulated_reward_per_share: u64,
        last_update_time: u64,
    }
    
    /// Deposit LP tokens to farm
    public fun deposit<StakeToken, RewardToken>(
        account: &signer,
        amount: u64
    ): u64 {
        let user_addr = signer::address_of(account);
        let now = timestamp::now_seconds();
        
        // Update farm state first
        update_farm<StakeToken, RewardToken>();
        
        // Add user's stake
        if (!exists<FarmPosition<StakeToken, RewardToken>>(user_addr)) {
            move_to(account, FarmPosition<StakeToken, RewardToken> {
                staked_amount: amount,
                reward_debt: 0,
                last_harvest_time: now,
            });
        } else {
            // Update existing position
            let position = borrow_global_mut<FarmPosition<StakeToken, RewardToken>>(user_addr);
            // Harvest pending rewards first
            let pending_rewards = get_pending_rewards(user_addr);
            position.staked_amount = position.staked_amount + amount;
            position.reward_debt = position.staked_amount * get_reward_per_share();
            position.last_harvest_time = now;
        }
        
        // Implementation would transfer LP tokens from user to farm
        
        // Return deposit ID        // Return deposit ID
        now
    }
    
    /// Withdraw LP tokens and rewards from farm
    public fun withdraw<StakeToken, RewardToken>(
        account: &signer,
        amount: u64
    ): u64 {
        let user_addr = signer::address_of(account);
        
        // Update farm state first
        update_farm<StakeToken, RewardToken>();
        
        // Get user's position
        let position = borrow_global_mut<FarmPosition<StakeToken, RewardToken>>(user_addr);
        
        // Ensure user has enough staked
        assert!(position.staked_amount >= amount, 301);
        
        // Calculate rewards
        let pending_rewards = get_pending_rewards(user_addr);
        
        // Update user's position
        position.staked_amount = position.staked_amount - amount;
        position.reward_debt = position.staked_amount * get_reward_per_share();
        
        // Implementation would transfer LP tokens and rewards to user
        
        // Return total rewards claimed
        pending_rewards
    }
    
    /// Harvest rewards without withdrawing stake
    public fun harvest<StakeToken, RewardToken>(
        account: &signer
    ): u64 {
        let user_addr = signer::address_of(account);
        
        // Update farm state
        update_farm<StakeToken, RewardToken>();
        
        // Calculate and transfer rewards
        let pending_rewards = get_pending_rewards(user_addr);
        
        // Update user's reward debt
        let position = borrow_global_mut<FarmPosition<StakeToken, RewardToken>>(user_addr);
        position.reward_debt = position.staked_amount * get_reward_per_share();
        
        // Implementation would transfer rewards to user
        
        // Return claimed rewards
        pending_rewards
    }
    
    /// Get estimate of pending rewards
    public fun get_pending_rewards<StakeToken, RewardToken>(
        user_addr: address
    ): u64 {
        // Calculate pending rewards based on stake amount and time
        // This would normally use accumulated reward per share
        
        // Simplified reward calculation for demo
        if (!exists<FarmPosition<StakeToken, RewardToken>>(user_addr)) {
            return 0
        }
        
        let position = borrow_global<FarmPosition<StakeToken, RewardToken>>(user_addr);
        let reward = position.staked_amount / 10; // 10% reward for simplicity
        
        reward
    }
    
    /// Internal function to update farm state
    fun update_farm<StakeToken, RewardToken>() {
        // Update accumulated rewards and last update time
        // Implementation would calculate new rewards since last update
        // and update accumulated reward per share
    }
    
    /// Get current reward per share
    fun get_reward_per_share<StakeToken, RewardToken>(): u64 {
        // This would be fetched from the farm state
        10 // Simplified for demo
    }
}`,
    functions: [
      {
        name: "deposit",
        description: "Deposit LP tokens to farm for rewards",
        parameters: ["amount"],
        returnType: "u64"
      },
      {
        name: "withdraw",
        description: "Withdraw LP tokens and claim rewards",
        parameters: ["amount"],
        returnType: "u64"
      },
      {
        name: "harvest",
        description: "Harvest rewards without withdrawing",
        parameters: [],
        returnType: "u64"
      },
      {
        name: "get_pending_rewards",
        description: "Check pending rewards for an address",
        parameters: ["user_addr"],
        returnType: "u64"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "flash-loan",
    name: "Flash Loan Provider",
    description: "A primitive for executing flash loans with a small fee",
    category: "lending",
    moduleAddress: "0x1",
    moduleName: "flash_loan",
    source: `
module flash_loan {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::account;
    
    /// Flash loan pool resource
    struct FlashLoanPool<phantom CoinType> has key {
        reserve: Coin<CoinType>,
        total_borrowed: u64,
        fee_bps: u64, // Fee in basis points (e.g., 30 = 0.3%)
    }
    
    /// Flash loan receipt - must be repaid within the same transaction
    struct FlashLoanReceipt<phantom CoinType> {
        amount: u64,
        fee: u64,
        borrower: address,
    }
    
    /// Borrow assets in a flash loan
    public fun borrow<CoinType>(
        account: &signer,
        amount: u64
    ): (Coin<CoinType>, FlashLoanReceipt<CoinType>) {
        let borrower = signer::address_of(account);
        
        // Get the pool
        let pool = borrow_global_mut<FlashLoanPool<CoinType>>(@flash_loan);
        
        // Ensure pool has enough liquidity
        assert!(coin::value(&pool.reserve) >= amount, 401);
        
        // Calculate fee
        let fee = (amount * pool.fee_bps) / 10000;
        
        // Create loan receipt - this must be returned when repaying
        let receipt = FlashLoanReceipt<CoinType> {
            amount,
            fee,
            borrower,
        };
        
        // Extract coins from pool
        let borrowed_coins = coin::extract(&mut pool.reserve, amount);
        
        // Update pool state
        pool.total_borrowed = pool.total_borrowed + amount;
        
        (borrowed_coins, receipt)
    }
    
    /// Repay a flash loan
    public fun repay<CoinType>(
        repayment_coins: Coin<CoinType>,
        receipt: FlashLoanReceipt<CoinType>
    ) {
        let FlashLoanReceipt { amount, fee, borrower } = receipt;
        
        // Verify repayment amount includes fee
        let repaid_amount = coin::value(&repayment_coins);
        assert!(repaid_amount >= amount + fee, 402);
        
        // Get the pool
        let pool = borrow_global_mut<FlashLoanPool<CoinType>>(@flash_loan);
        
        // Return liquidity to pool
        coin::merge(&mut pool.reserve, repayment_coins);
        
        // Update pool state
        pool.total_borrowed = pool.total_borrowed - amount;
    }
    
    /// Execute a flash loan with callback
    public fun execute_flash_loan<CoinType>(
        account: &signer,
        amount: u64,
        // This would normally accept a callback function
    ): u64 {
        let borrower = signer::address_of(account);
        
        // Borrow the flash loan
        let (borrowed_coins, receipt) = borrow<CoinType>(account, amount);
        
        // In a real implementation, we would execute a callback here
        // that does something with the borrowed funds
        
        // For demonstration, we'll simulate a successful repayment
        let fee = receipt.fee;
        
        // Repay the loan (in real implementation, the callback would do this)
        repay(borrowed_coins, receipt);
        
        // Return the fee paid
        fee
    }
}`,
    functions: [
      {
        name: "borrow",
        description: "Borrow assets in a flash loan",
        parameters: ["amount"],
        returnType: "(Coin<CoinType>, FlashLoanReceipt<CoinType>)"
      },
      {
        name: "repay",
        description: "Repay a flash loan with fee",
        parameters: ["repayment_coins", "receipt"],
        returnType: ""
      },
      {
        name: "execute_flash_loan",
        description: "Execute a complete flash loan with callback",
        parameters: ["amount"],
        returnType: "u64"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    
    const db = client.db(dbName);
    const primitiveCollection = db.collection('primitives');
    
    // Drop the existing collection to force reseed
    console.log('Dropping existing primitives collection...');
    await primitiveCollection.drop().catch(err => {
      // Ignore error if collection doesn't exist
      if (err.code !== 26) {
        console.error('Error dropping collection:', err);
      } else {
        console.log('Collection does not exist, proceeding with seed');
      }
    });
    
    // Log primitive details before inserting
    console.log('Primitive details:');
    mockPrimitives.forEach((primitive, index) => {
      console.log(`Primitive ${index + 1}:`, JSON.stringify({
        id: primitive.id,
        name: primitive.name,
        category: primitive.category,
        // Other important fields
      }));
    });
    
    // Insert the mock primitives
    console.log('Seeding database with primitives...');
    const result = await primitiveCollection.insertMany(mockPrimitives);
    console.log(`Successfully seeded database with ${result.insertedCount} primitives.`);
    
    // Verify the primitives were inserted correctly
    const insertedPrimitives = await primitiveCollection.find({}).toArray();
    console.log(`Verification: Found ${insertedPrimitives.length} primitives in the database.`);
    insertedPrimitives.forEach((primitive, index) => {
      console.log(`Inserted primitive ${index + 1}:`, JSON.stringify({
        id: primitive.id,
        name: primitive.name,
        _id: primitive._id,
      }));
    });
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

seedDatabase();