module defi_matrix::lending_primitive {
    use std::error;
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_std::table::{Self, Table};
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    
    /// Error codes
    const EINSUFFICIENT_BALANCE: u64 = 1;
    const EINSUFFICIENT_COLLATERAL: u64 = 2;
    const EZERO_AMOUNT: u64 = 3;
    const EPOOL_NOT_FOUND: u64 = 4;
    const EUSER_NOT_FOUND: u64 = 5;
    const EINVALID_INTEREST_RATE: u64 = 6;
    
    /// Represents a lending pool for a specific coin type
    struct LendingPool<phantom CoinType> has key {
        /// Total deposited coins
        total_deposits: u64,
        /// Total borrowed coins
        total_borrows: u64,
        /// Interest rate for borrowing (in basis points, e.g., 500 = 5%)
        borrow_interest_rate: u64,
        /// Interest rate for deposits (in basis points)
        deposit_interest_rate: u64,
        /// Last update timestamp
        last_update_time: u64,
        /// User balances and borrows
        user_states: Table<address, UserState>,
        /// Events
        deposit_events: EventHandle<DepositEvent>,
        withdraw_events: EventHandle<WithdrawEvent>,
        borrow_events: EventHandle<BorrowEvent>,
        repay_events: EventHandle<RepayEvent>,
    }
    
    /// User state in the lending pool
    struct UserState has store, drop {
        /// Deposited amount
        deposited: u64,
        /// Borrowed amount
        borrowed: u64,
        /// Last update timestamp for interest calculation
        last_update_time: u64,
    }
    
    /// Events
    struct DepositEvent has drop, store {
        user: address,
        amount: u64,
        timestamp: u64,
    }
    
    struct WithdrawEvent has drop, store {
        user: address,
        amount: u64,
        timestamp: u64,
    }
    
    struct BorrowEvent has drop, store {
        user: address,
        amount: u64,
        timestamp: u64,
    }
    
    struct RepayEvent has drop, store {
        user: address,
        amount: u64,
        timestamp: u64,
    }
    
    /// Initialize a new lending pool for a specific coin type
    public fun initialize_pool<CoinType>(
        admin: &signer,
        borrow_interest_rate: u64,
        deposit_interest_rate: u64,
    ) {
        // Validate interest rates
        assert!(
            borrow_interest_rate > deposit_interest_rate,
            error::invalid_argument(EINVALID_INTEREST_RATE)
        );
        
        let admin_addr = signer::address_of(admin);
        
        // Create a new lending pool
        let pool = LendingPool<CoinType> {
            total_deposits: 0,
            total_borrows: 0,
            borrow_interest_rate,
            deposit_interest_rate,
            last_update_time: timestamp::now_seconds(),
            user_states: table::new(),
            deposit_events: event::new_event_handle<DepositEvent>(admin),
            withdraw_events: event::new_event_handle<WithdrawEvent>(admin),
            borrow_events: event::new_event_handle<BorrowEvent>(admin),
            repay_events: event::new_event_handle<RepayEvent>(admin),
        };
        
        // Save the pool to global storage
        move_to(admin, pool);
    }
    
    /// Deposit coins into the lending pool
    public fun deposit<CoinType>(
        user: &signer,
        amount: u64,
    ) acquires LendingPool {
        let user_addr = signer::address_of(user);
        
        // Check that amount is not zero
        assert!(amount > 0, error::invalid_argument(EZERO_AMOUNT));
        
        // Get the lending pool
        let pool = borrow_global_mut<LendingPool<CoinType>>(@defi_matrix);
        
        // Update the pool's interest accruals
        update_pool_interest<CoinType>(pool);
        
        // Withdraw coins from the user's account and deposit to the pool
        let coins = coin::withdraw<CoinType>(user, amount);
        
        // Initialize user state if not exists
        if (!table::contains(&pool.user_states, user_addr)) {
            table::add(&mut pool.user_states, user_addr, UserState {
                deposited: 0,
                borrowed: 0,
                last_update_time: timestamp::now_seconds(),
            });
        };
        
        // Get user state
        let user_state = table::borrow_mut(&mut pool.user_states, user_addr);
        
        // Update user state
        user_state.deposited = user_state.deposited + amount;
        user_state.last_update_time = timestamp::now_seconds();
        
        // Update pool state
        pool.total_deposits = pool.total_deposits + amount;
        
        // Emit deposit event
        event::emit_event(
            &mut pool.deposit_events,
            DepositEvent {
                user: user_addr,
                amount,
                timestamp: timestamp::now_seconds(),
            },
        );
        
        // Destroy the coins (they're now tracked in the pool)
        coin::destroy_zero(coins);
    }
    
    /// Withdraw coins from the lending pool
    public fun withdraw<CoinType>(
        user: &signer,
        amount: u64,
    ) acquires LendingPool {
        let user_addr = signer::address_of(user);
        
        // Check that amount is not zero
        assert!(amount > 0, error::invalid_argument(EZERO_AMOUNT));
        
        // Get the lending pool
        let pool = borrow_global_mut<LendingPool<CoinType>>(@defi_matrix);
        
        // Update the pool's interest accruals
        update_pool_interest<CoinType>(pool);
        
        // Check if user exists in the pool
        assert!(
            table::contains(&pool.user_states, user_addr),
            error::not_found(EUSER_NOT_FOUND)
        );
        
        // Get user state
        let user_state = table::borrow_mut(&mut pool.user_states, user_addr);
        
        // Check if user has enough deposited
        assert!(
            user_state.deposited >= amount,
            error::invalid_argument(EINSUFFICIENT_BALANCE)
        );
        
        // Calculate the user's collateral ratio after withdrawal
        let new_deposited = user_state.deposited - amount;
        if (user_state.borrowed > 0) {
            // Ensure withdrawal doesn't leave user under-collateralized
            // Typically would implement a more complex formula based on asset volatility
            assert!(
                new_deposited >= user_state.borrowed * 2, // Simple 200% collateralization requirement
                error::invalid_argument(EINSUFFICIENT_COLLATERAL)
            );
        };
        
        // Update user state
        user_state.deposited = new_deposited;
        user_state.last_update_time = timestamp::now_seconds();
        
        // Update pool state
        pool.total_deposits = pool.total_deposits - amount;
        
        // Mint new coins to the user
        let coins = coin::withdraw<CoinType>(&@defi_matrix, amount);
        coin::deposit(user_addr, coins);
        
        // Emit withdraw event
        event::emit_event(
            &mut pool.withdraw_events,
            WithdrawEvent {
                user: user_addr,
                amount,
                timestamp: timestamp::now_seconds(),
            },
        );
    }
    
    /// Borrow coins from the lending pool
    public fun borrow<CoinType>(
        user: &signer,
        amount: u64,
    ) acquires LendingPool {
        let user_addr = signer::address_of(user);
        
        // Check that amount is not zero
        assert!(amount > 0, error::invalid_argument(EZERO_AMOUNT));
        
        // Get the lending pool
        let pool = borrow_global_mut<LendingPool<CoinType>>(@defi_matrix);
        
        // Update the pool's interest accruals
        update_pool_interest<CoinType>(pool);
        
        // Check if user exists in the pool
        assert!(
            table::contains(&pool.user_states, user_addr),
            error::not_found(EUSER_NOT_FOUND)
        );
        
        // Get user state
        let user_state = table::borrow_mut(&mut pool.user_states, user_addr);
        
        // Check if pool has enough liquidity
        assert!(
            pool.total_deposits - pool.total_borrows >= amount,
            error::resource_exhausted(EINSUFFICIENT_BALANCE)
        );
        
        // Calculate new borrowed amount
        let new_borrowed = user_state.borrowed + amount;
        
        // Check if the user has enough collateral
        // Using a simple 50% LTV ratio for this example
        assert!(
            user_state.deposited * 2 >= new_borrowed,
            error::invalid_argument(EINSUFFICIENT_COLLATERAL)
        );
        
        // Update user state
        user_state.borrowed = new_borrowed;
        user_state.last_update_time = timestamp::now_seconds();
        
        // Update pool state
        pool.total_borrows = pool.total_borrows + amount;
        
        // Mint new coins to the user
        let coins = coin::withdraw<CoinType>(&@defi_matrix, amount);
        coin::deposit(user_addr, coins);
        
        // Emit borrow event
        event::emit_event(
            &mut pool.borrow_events,
            BorrowEvent {
                user: user_addr,
                amount,
                timestamp: timestamp::now_seconds(),
            },
        );
    }
    
    /// Repay borrowed coins
    public fun repay<CoinType>(
        user: &signer,
        amount: u64,
    ) acquires LendingPool {
        let user_addr = signer::address_of(user);
        
        // Check that amount is not zero
        assert!(amount > 0, error::invalid_argument(EZERO_AMOUNT));
        
        // Get the lending pool
        let pool = borrow_global_mut<LendingPool<CoinType>>(@defi_matrix);
        
        // Update the pool's interest accruals
        update_pool_interest<CoinType>(pool);
        
        // Check if user exists in the pool
        assert!(
            table::contains(&pool.user_states, user_addr),
            error::not_found(EUSER_NOT_FOUND)
        );
        
        // Get user state
        let user_state = table::borrow_mut(&mut pool.user_states, user_addr);
        
        // Check if user has outstanding borrows
        assert!(
            user_state.borrowed > 0,
            error::invalid_state(EINSUFFICIENT_BALANCE)
        );
        
        // Calculate actual repay amount (can't repay more than borrowed)
        let repay_amount = if (amount > user_state.borrowed) {
            user_state.borrowed
        } else {
            amount
        };
        
        // Withdraw coins from the user's account and deposit to the pool
        let coins = coin::withdraw<CoinType>(user, repay_amount);
        
        // Update user state
        user_state.borrowed = user_state.borrowed - repay_amount;
        user_state.last_update_time = timestamp::now_seconds();
        
        // Update pool state
        pool.total_borrows = pool.total_borrows - repay_amount;
        
        // Emit repay event
        event::emit_event(
            &mut pool.repay_events,
            RepayEvent {
                user: user_addr,
                amount: repay_amount,
                timestamp: timestamp::now_seconds(),
            },
        );
        
        // Destroy the coins (they're now tracked in the pool)
        coin::destroy_zero(coins);
    }
    
    /// Helper function to update the pool's interest accruals
    fun update_pool_interest<CoinType>(pool: &mut LendingPool<CoinType>) {
        let current_time = timestamp::now_seconds();
        let time_elapsed = current_time - pool.last_update_time;
        
        if (time_elapsed > 0) {
            // Update the pool's last update time
            pool.last_update_time = current_time;
            
            // In a real implementation, we would accrue interest here
            // based on time_elapsed, borrow_interest_rate, and deposit_interest_rate
            // For simplicity, this example doesn't implement the actual interest calculations
        }
    }
    
    /// Get user's deposit amount
    public fun get_user_deposit<CoinType>(user_addr: address): u64 acquires LendingPool {
        let pool = borrow_global<LendingPool<CoinType>>(@defi_matrix);
        
        if (!table::contains(&pool.user_states, user_addr)) {
            return 0
        };
        
        let user_state = table::borrow(&pool.user_states, user_addr);
        user_state.deposited
    }
    
    /// Get user's borrowed amount
    public fun get_user_borrow<CoinType>(user_addr: address): u64 acquires LendingPool {
        let pool = borrow_global<LendingPool<CoinType>>(@defi_matrix);
        
        if (!table::contains(&pool.user_states, user_addr)) {
            return 0
        };
        
        let user_state = table::borrow(&pool.user_states, user_addr);
        user_state.borrowed
    }
    
    /// Get pool total deposits
    public fun get_total_deposits<CoinType>(): u64 acquires LendingPool {
        let pool = borrow_global<LendingPool<CoinType>>(@defi_matrix);
        pool.total_deposits
    }
    
    /// Get pool total borrows
    public fun get_total_borrows<CoinType>(): u64 acquires LendingPool {
        let pool = borrow_global<LendingPool<CoinType>>(@defi_matrix);
        pool.total_borrows
    }
} 