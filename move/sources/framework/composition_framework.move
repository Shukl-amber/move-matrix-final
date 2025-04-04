module defi_matrix::composition_framework {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_std::table::{Self, Table};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    
    /// Error codes
    const EUNAUTHORIZED: u64 = 1;
    const EPRIMITIVE_EXISTS: u64 = 2;
    const EPRIMITIVE_NOT_FOUND: u64 = 3;
    const ECOMPOSITION_EXISTS: u64 = 4;
    const ECOMPOSITION_NOT_FOUND: u64 = 5;
    const EEMPTY_INPUT: u64 = 6;
    
    /// Registry for primitives and compositions
    struct Registry has key {
        /// Available primitives
        primitives: Table<String, PrimitiveInfo>,
        /// User compositions
        compositions: Table<String, CompositionInfo>,
        /// Events
        primitive_register_events: EventHandle<PrimitiveRegisterEvent>,
        composition_create_events: EventHandle<CompositionCreateEvent>,
    }
    
    /// Information about a primitive
    struct PrimitiveInfo has store, drop {
        /// Name of the primitive
        name: String,
        /// Address of the module
        module_address: address,
        /// Name of the module
        module_name: String,
        /// Available functions
        functions: vector<String>,
        /// Registration timestamp
        registered_at: u64,
    }
    
    /// Connection between two primitives in a composition
    struct Connection has store, drop {
        /// Source primitive ID
        source_primitive: String,
        /// Source function
        source_function: String,
        /// Target primitive ID
        target_primitive: String,
        /// Target function
        target_function: String,
    }
    
    /// Information about a composition
    struct CompositionInfo has store, drop {
        /// Name of the composition
        name: String,
        /// Description of the composition
        description: String,
        /// Owner of the composition
        owner: address,
        /// Primitives used in this composition
        primitives: vector<String>,
        /// Connections between primitives
        connections: vector<Connection>,
        /// Creation timestamp
        created_at: u64,
        /// Last update timestamp
        updated_at: u64,
    }
    
    /// Events
    struct PrimitiveRegisterEvent has drop, store {
        name: String,
        module_address: address,
        module_name: String,
        functions: vector<String>,
        timestamp: u64,
    }
    
    struct CompositionCreateEvent has drop, store {
        name: String,
        owner: address,
        primitives: vector<String>,
        timestamp: u64,
    }
    
    /// Initialize the registry
    public fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        // Create a new registry
        let registry = Registry {
            primitives: table::new(),
            compositions: table::new(),
            primitive_register_events: event::new_event_handle<PrimitiveRegisterEvent>(admin),
            composition_create_events: event::new_event_handle<CompositionCreateEvent>(admin),
        };
        
        // Save the registry to global storage
        move_to(admin, registry);
    }
    
    /// Register a new primitive
    public fun register_primitive(
        admin: &signer,
        name: String,
        module_address: address,
        module_name: String,
        functions: vector<String>,
    ) acquires Registry {
        let admin_addr = signer::address_of(admin);
        
        // Ensure only the admin can register primitives
        assert!(admin_addr == @defi_matrix, error::permission_denied(EUNAUTHORIZED));
        
        // Ensure primitive name is not empty
        assert!(!string::is_empty(&name), error::invalid_argument(EEMPTY_INPUT));
        
        // Get the registry
        let registry = borrow_global_mut<Registry>(@defi_matrix);
        
        // Ensure primitive doesn't already exist
        assert!(!table::contains(&registry.primitives, name), error::already_exists(EPRIMITIVE_EXISTS));
        
        // Create primitive info
        let primitive_info = PrimitiveInfo {
            name: name,
            module_address,
            module_name,
            functions,
            registered_at: timestamp::now_seconds(),
        };
        
        // Add primitive to the registry
        table::add(&mut registry.primitives, name, primitive_info);
        
        // Emit event
        event::emit_event(
            &mut registry.primitive_register_events,
            PrimitiveRegisterEvent {
                name,
                module_address,
                module_name,
                functions,
                timestamp: timestamp::now_seconds(),
            },
        );
    }
    
    /// Create a new composition
    public fun create_composition(
        user: &signer,
        name: String,
        description: String,
        primitives: vector<String>,
        connections: vector<Connection>,
    ) acquires Registry {
        let user_addr = signer::address_of(user);
        
        // Ensure composition name is not empty
        assert!(!string::is_empty(&name), error::invalid_argument(EEMPTY_INPUT));
        
        // Get the registry
        let registry = borrow_global_mut<Registry>(@defi_matrix);
        
        // Ensure composition doesn't already exist
        assert!(!table::contains(&registry.compositions, name), error::already_exists(ECOMPOSITION_EXISTS));
        
        // Ensure all primitives exist
        let i = 0;
        let primitives_len = vector::length(&primitives);
        while (i < primitives_len) {
            let primitive_name = *vector::borrow(&primitives, i);
            assert!(
                table::contains(&registry.primitives, primitive_name),
                error::not_found(EPRIMITIVE_NOT_FOUND)
            );
            i = i + 1;
        };
        
        // Create composition info
        let composition_info = CompositionInfo {
            name,
            description,
            owner: user_addr,
            primitives,
            connections,
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
        };
        
        // Add composition to the registry
        table::add(&mut registry.compositions, name, composition_info);
        
        // Emit event
        event::emit_event(
            &mut registry.composition_create_events,
            CompositionCreateEvent {
                name,
                owner: user_addr,
                primitives,
                timestamp: timestamp::now_seconds(),
            },
        );
    }
    
    /// Update an existing composition
    public fun update_composition(
        user: &signer,
        name: String,
        description: String,
        primitives: vector<String>,
        connections: vector<Connection>,
    ) acquires Registry {
        let user_addr = signer::address_of(user);
        
        // Get the registry
        let registry = borrow_global_mut<Registry>(@defi_matrix);
        
        // Ensure composition exists
        assert!(table::contains(&registry.compositions, name), error::not_found(ECOMPOSITION_NOT_FOUND));
        
        // Get composition info
        let composition_info = table::borrow_mut(&mut registry.compositions, name);
        
        // Ensure user is the owner
        assert!(composition_info.owner == user_addr, error::permission_denied(EUNAUTHORIZED));
        
        // Ensure all primitives exist
        let i = 0;
        let primitives_len = vector::length(&primitives);
        while (i < primitives_len) {
            let primitive_name = *vector::borrow(&primitives, i);
            assert!(
                table::contains(&registry.primitives, primitive_name),
                error::not_found(EPRIMITIVE_NOT_FOUND)
            );
            i = i + 1;
        };
        
        // Update composition info
        composition_info.description = description;
        composition_info.primitives = primitives;
        composition_info.connections = connections;
        composition_info.updated_at = timestamp::now_seconds();
    }
    
    /// Delete a composition
    public fun delete_composition(
        user: &signer,
        name: String,
    ) acquires Registry {
        let user_addr = signer::address_of(user);
        
        // Get the registry
        let registry = borrow_global_mut<Registry>(@defi_matrix);
        
        // Ensure composition exists
        assert!(table::contains(&registry.compositions, name), error::not_found(ECOMPOSITION_NOT_FOUND));
        
        // Get composition info to check ownership
        let composition_info = table::borrow(&registry.compositions, name);
        
        // Ensure user is the owner or admin
        assert!(
            composition_info.owner == user_addr || user_addr == @defi_matrix,
            error::permission_denied(EUNAUTHORIZED)
        );
        
        // Remove the composition
        table::remove(&mut registry.compositions, name);
    }
    
    /// Get primitive info
    public fun get_primitive_info(name: String): (address, String, vector<String>) acquires Registry {
        let registry = borrow_global<Registry>(@defi_matrix);
        
        // Ensure primitive exists
        assert!(table::contains(&registry.primitives, name), error::not_found(EPRIMITIVE_NOT_FOUND));
        
        // Get primitive info
        let primitive_info = table::borrow(&registry.primitives, name);
        
        (primitive_info.module_address, primitive_info.module_name, primitive_info.functions)
    }
    
    /// Check if primitive exists
    public fun primitive_exists(name: String): bool acquires Registry {
        let registry = borrow_global<Registry>(@defi_matrix);
        table::contains(&registry.primitives, name)
    }
    
    /// Check if composition exists
    public fun composition_exists(name: String): bool acquires Registry {
        let registry = borrow_global<Registry>(@defi_matrix);
        table::contains(&registry.compositions, name)
    }
    
    /// Get all primitive names
    public fun get_all_primitive_names(): vector<String> acquires Registry {
        let registry = borrow_global<Registry>(@defi_matrix);
        
        let primitive_names = vector::empty<String>();
        let keys = table::keys(&registry.primitives);
        
        let i = 0;
        let len = vector::length(&keys);
        while (i < len) {
            vector::push_back(&mut primitive_names, *vector::borrow(&keys, i));
            i = i + 1;
        };
        
        primitive_names
    }
    
    /// Get all composition names for a specific user
    public fun get_user_composition_names(user_addr: address): vector<String> acquires Registry {
        let registry = borrow_global<Registry>(@defi_matrix);
        
        let composition_names = vector::empty<String>();
        let keys = table::keys(&registry.compositions);
        
        let i = 0;
        let len = vector::length(&keys);
        while (i < len) {
            let name = *vector::borrow(&keys, i);
            let composition_info = table::borrow(&registry.compositions, name);
            
            if (composition_info.owner == user_addr) {
                vector::push_back(&mut composition_names, name);
            };
            
            i = i + 1;
        };
        
        composition_names
    }
    
    /// Get composition primitives
    public fun get_composition_primitives(name: String): vector<String> acquires Registry {
        let registry = borrow_global<Registry>(@defi_matrix);
        
        // Ensure composition exists
        assert!(table::contains(&registry.compositions, name), error::not_found(ECOMPOSITION_NOT_FOUND));
        
        // Get composition info
        let composition_info = table::borrow(&registry.compositions, name);
        
        composition_info.primitives
    }
} 