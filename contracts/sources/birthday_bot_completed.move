module overmind::birthday_bot {
    //==============================================================================================
    // Dependencies
    //==============================================================================================
    use std::table;
    use std::signer;
    use std::vector;
    use std::table::Table;
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::simple_map;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;

    #[test_only]
    use aptos_framework::aptos_coin;

    //==============================================================================================
    // Constants - DO NOT MODIFY
    //==============================================================================================

    const SEED: vector<u8> = b"birthday bot";

   //==============================================================================================
    // Error codes - DO NOT MODIFY
    //==============================================================================================
    const EDistributionStoreDoesNotExist: u64 = 0;
    const EBirthdayGiftDoesNotExist: u64 = 2;
    const EBirthdayTimestampHasNotPassed: u64 = 3;
    const EInsufficientAptBalance: u64 = 4;
    const EGiftAmountZero: u64 = 5;

    //==============================================================================================
    // Module Structs - DO NOT MODIFY
    //==============================================================================================

    struct BirthdayGift has store {
        birthday_coin: Coin<AptosCoin>,
        birthday_timestamp_seconds: u64
    }

    struct DistributionStore has key {
        gifter: address,
        birthday_gifts: simple_map::SimpleMap<address, BirthdayGift>
    }

    struct ReverseGiftLookUp has key {
        look_up: Table<address, vector<address>>
    }

    struct ModuleEvents has key {
        birthday_gift_added_events: event::EventHandle<BirthdayGiftAddedEvent>,
        birthday_gift_removed_events: event::EventHandle<BirthdayGiftRemovedEvent>,
        birthday_gift_claimed_events: event::EventHandle<BirthdayGiftClaimedEvent>
    }

    //==============================================================================================
    // Event structs - DO NOT MODIFY
    //==============================================================================================

    struct BirthdayGiftAddedEvent has store, drop {
        gifter: address, 
        recipient: address, 
        gift_amount_apt: u64, 
        birthday_timestamp_seconds: u64,
        event_creation_timestamp_seconds: u64
    }

    struct BirthdayGiftRemovedEvent has store, drop {
        gifter: address, 
        recipient: address, 
        gift_amount_apt: u64, 
        birthday_timestamp_seconds: u64,
        event_creation_timestamp_seconds: u64
    }

    struct BirthdayGiftClaimedEvent has store, drop {
        gifter: address, 
        recipient: address, 
        gift_amount_apt: u64, 
        birthday_timestamp_seconds: u64,
        event_creation_timestamp_seconds: u64
    }

    //==============================================================================================
    // Functions
    //==============================================================================================
    fun init_module(admin: &signer) {
        let (resource_account_signer, _signer_cap) = account::create_resource_account(admin, SEED);

        coin::register<AptosCoin>(&resource_account_signer);

        move_to<ReverseGiftLookUp>(
            &resource_account_signer, 
            ReverseGiftLookUp {
                look_up: table::new()
            }
        );

        move_to<ModuleEvents>(
            &resource_account_signer, 
            ModuleEvents {
                birthday_gift_added_events: account::new_event_handle(&resource_account_signer),
                birthday_gift_removed_events: account::new_event_handle(&resource_account_signer),
                birthday_gift_claimed_events: account::new_event_handle(&resource_account_signer)
            }
        );
    }

    public entry fun add_birthday_gift(
        gifter: &signer,
        recipient: address,
        gift_amount_apt: u64,
        birthday_timestamp_seconds: u64
    ) acquires DistributionStore, ReverseGiftLookUp, ModuleEvents {

        let gifter_address = signer::address_of(gifter);

        if (!exists<DistributionStore>(gifter_address)) 
        {
            move_to(gifter, DistributionStore {
                gifter: gifter_address,
                birthday_gifts: simple_map::new(),
            });
        };

        assert_sufficient_apt_balance(gifter_address, gift_amount_apt);

        let distribution_store = borrow_global_mut<DistributionStore>(gifter_address);

        if (simple_map::contains_key(&mut distribution_store.birthday_gifts, &recipient)) 
        {
            let birthday_coin = coin::withdraw<AptosCoin>(gifter, gift_amount_apt);

            let birthday_gift = 
                simple_map::borrow_mut(&mut distribution_store.birthday_gifts, &recipient);
            coin::merge(&mut birthday_gift.birthday_coin, birthday_coin);

            * &mut birthday_gift.birthday_timestamp_seconds = birthday_timestamp_seconds;
        } else 
        {
            assert_gift_amount_above_zero(gift_amount_apt);

            let birthday_coin = coin::withdraw<AptosCoin>(gifter, gift_amount_apt);

            let new_birthday_gift = BirthdayGift {
                birthday_coin, 
                birthday_timestamp_seconds
            };
            simple_map::add(&mut distribution_store.birthday_gifts, recipient, new_birthday_gift);

            let reverse_gift_look_up = borrow_global_mut<ReverseGiftLookUp>(get_resource_address());
            if (table::contains(&reverse_gift_look_up.look_up, recipient)) 
            {
                let gifters = table::borrow_mut(&mut reverse_gift_look_up.look_up, recipient);
                vector::push_back(gifters, gifter_address);
            } else 
            {
                let gifters = vector::empty();
                vector::push_back(&mut gifters, gifter_address);
                table::add(&mut reverse_gift_look_up.look_up, recipient, gifters);
            };
        };

        let module_events = borrow_global_mut<ModuleEvents>(get_resource_address());
        event::emit_event(
            &mut module_events.birthday_gift_added_events,
            BirthdayGiftAddedEvent {
                gifter: gifter_address, 
                recipient, 
                gift_amount_apt, 
                birthday_timestamp_seconds,
                event_creation_timestamp_seconds: timestamp::now_seconds()
            }
        );
    }

    public entry fun remove_birthday_gift(
        gifter: &signer,
        recipient: address,
    ) acquires DistributionStore, ReverseGiftLookUp, ModuleEvents {
        let gifter_address = signer::address_of(gifter);

        assert_distribution_store_exists(gifter_address);

        let distribution_store = borrow_global_mut<DistributionStore>(gifter_address);

        if (simple_map::contains_key(&mut distribution_store.birthday_gifts, &recipient)) {
            let (
                _, 
                BirthdayGift {
                    birthday_coin, 
                    birthday_timestamp_seconds
                }
            ) = simple_map::remove(&mut distribution_store.birthday_gifts, &recipient);

            let gift_amount_apt = coin::value<AptosCoin>(&birthday_coin);

            coin::deposit<AptosCoin>(gifter_address, birthday_coin);

            let reverse_gift_look_up = borrow_global_mut<ReverseGiftLookUp>(get_resource_address());
            let gifters = table::borrow_mut(&mut reverse_gift_look_up.look_up, recipient);
            let (_, gifter_index) = vector::index_of(gifters, &gifter_address);
            vector::remove(gifters, gifter_index);

            let module_events = borrow_global_mut<ModuleEvents>(get_resource_address());
            event::emit_event(
                &mut module_events.birthday_gift_removed_events,
                BirthdayGiftRemovedEvent {
                    gifter: gifter_address, 
                    recipient, 
                    gift_amount_apt,
                    birthday_timestamp_seconds,
                    event_creation_timestamp_seconds: timestamp::now_seconds()
                }
            );
        };
    }

    public entry fun claim_birthday_gift(
        recipient: &signer,
        gifter: address
    ) acquires DistributionStore, ReverseGiftLookUp, ModuleEvents {
        let recipient_address = signer::address_of(recipient);

        assert_distribution_store_exists(gifter);
        assert_birthday_gift_exists(gifter, recipient_address);
        assert_birthday_timestamp_seconds_has_passed(gifter, recipient_address);

        let distribution_store = borrow_global_mut<DistributionStore>(gifter);
        let (
            _, 
            BirthdayGift {
                birthday_coin, 
                birthday_timestamp_seconds
            }
        ) = simple_map::remove(&mut distribution_store.birthday_gifts, &recipient_address);

        let reverse_gift_look_up = borrow_global_mut<ReverseGiftLookUp>(get_resource_address());
        let gifters = table::borrow_mut(&mut reverse_gift_look_up.look_up, signer::address_of(recipient));
        let (_, gifter_index) = vector::index_of(gifters, &gifter);
        vector::remove(gifters, gifter_index);

        let gift_amount_apt = coin::value<AptosCoin>(&birthday_coin);

        coin::deposit<AptosCoin>(recipient_address, birthday_coin);

        let module_events = borrow_global_mut<ModuleEvents>(get_resource_address());
        event::emit_event(
            &mut module_events.birthday_gift_claimed_events,
            BirthdayGiftClaimedEvent {
                recipient: recipient_address, 
                gifter, 
                gift_amount_apt,
                birthday_timestamp_seconds,
                event_creation_timestamp_seconds: timestamp::now_seconds()
            }
        );
    }

    #[view]
    public fun view_gifters_gifts(gifter: address): (vector<address>, vector<u64>, vector<u64>)
    acquires DistributionStore {

        if (!exists<DistributionStore>(gifter)) {
            return (vector::empty(), vector::empty(), vector::empty())
        };

        let distribution_store = borrow_global<DistributionStore>(gifter);
        let birthday_gifts = &distribution_store.birthday_gifts;

        let recipients = simple_map::keys(birthday_gifts);

        let birthday_coin_amounts = vector::empty();
        let birthday_timestamps_seconds = vector::empty();

        let number_gifts = simple_map::length(birthday_gifts);
        let i = 0;
        while (i < number_gifts) {
            let recipient = vector::borrow(&recipients, i);
            let birthday_gift = simple_map::borrow(birthday_gifts, recipient);
            vector::push_back(
                &mut birthday_coin_amounts, 
                coin::value<AptosCoin>(&birthday_gift.birthday_coin)
            );
            vector::push_back(
                &mut birthday_timestamps_seconds, 
                birthday_gift.birthday_timestamp_seconds
            );
            i = i + 1;
        };

        (recipients, birthday_coin_amounts, birthday_timestamps_seconds)
    }

    #[view]
    public fun view_recipients_gifts(recipient: address): (vector<address>, vector<u64>, vector<u64>) acquires ReverseGiftLookUp, DistributionStore {
        let reverse_gift_look_up = borrow_global<ReverseGiftLookUp>(get_resource_address());
        
        if (!table::contains(&reverse_gift_look_up.look_up, recipient)) {
            return (vector::empty(), vector::empty(), vector::empty())
        };

        let gifters = table::borrow(&reverse_gift_look_up.look_up, recipient);

        let number_gifts = vector::length(gifters);

        let gift_froms = vector::empty();
        let gift_amounts = vector::empty();
        let gift_timestamps_seconds = vector::empty();

        let i = 0;
        while (i < number_gifts) {

            let gifter = *vector::borrow(gifters, i);
            let distribution_store = borrow_global<DistributionStore>(gifter);
            let birthday_gift = simple_map::borrow(&distribution_store.birthday_gifts, &recipient);

            vector::push_back(
                &mut gift_froms, 
                gifter
            );

            vector::push_back(
                &mut gift_amounts, 
                coin::value<AptosCoin>(&birthday_gift.birthday_coin)
            );

            vector::push_back(
                &mut gift_timestamps_seconds, 
                birthday_gift.birthday_timestamp_seconds
            );

            i = i + 1;
        };

        (gift_froms, gift_amounts, gift_timestamps_seconds)

    }

    //==============================================================================================
    // Helper functions
    //==============================================================================================

    fun get_resource_address(): address {
        account::create_resource_address(&@overmind, SEED)
    }

    //==============================================================================================
    // Assert functions
    //==============================================================================================

    inline fun assert_distribution_store_exists(account_address: address) {
        assert!(
            exists<DistributionStore>(account_address),
            EDistributionStoreDoesNotExist
        );
    }

    inline fun assert_birthday_gift_exists(distribution_address: address,address: address) 
    acquires DistributionStore {
        let distribution_store = borrow_global_mut<DistributionStore>(distribution_address);

        assert!(
            simple_map::contains_key(&mut distribution_store.birthday_gifts, &address),
            EBirthdayGiftDoesNotExist
        );
    }

    inline fun assert_birthday_timestamp_seconds_has_passed( 
        distribution_address: address, 
        recipient: address
    ) acquires DistributionStore {
        let distribution_store = borrow_global_mut<DistributionStore>(distribution_address);
        let birthday_gift = simple_map::borrow(&distribution_store.birthday_gifts, &recipient);

        assert!(
            timestamp::now_seconds() > birthday_gift.birthday_timestamp_seconds,
            EBirthdayTimestampHasNotPassed
        );
    }

    inline fun assert_sufficient_apt_balance(account_address: address, amount: u64) {
        assert!(coin::balance<AptosCoin>(account_address) >= amount,EInsufficientAptBalance);
    }

    inline fun assert_gift_amount_above_zero(amount: u64,) {
        assert!(amount > 0, EGiftAmountZero);
    }
}