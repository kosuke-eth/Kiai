module kiai::arena;

use std::string::String;
use sui::clock::Clock;
use sui::event;

const ENotAdmin: u64 = 0;
const EProfileNotClaimed: u64 = 1;
const EInsufficientEnergy: u64 = 2;
const EScenarioNotFound: u64 = 3;
const EScenarioNotOpen: u64 = 4;
const EScenarioCannotArchive: u64 = 5;
const EScenarioCannotPublish: u64 = 6;
const EScenarioCannotLock: u64 = 7;
const EScenarioCannotSettle: u64 = 8;
const EEnergyClaimTooEarly: u64 = 9;

const StateDraft: u8 = 0;
const StateOpen: u8 = 1;
const StateLocked: u8 = 2;
const StateSettled: u8 = 3;
const StateArchived: u8 = 4;

const TierWhite: u8 = 0;
const TierBlue: u8 = 1;
const TierPurple: u8 = 2;
const TierBrown: u8 = 3;
const TierBlack: u8 = 4;

const MinScenarioWindowMs: u64 = 30_000;
const DefaultSettlementWindowMs: u64 = 90_000;
const DefaultEnergyClaimAmount: u64 = 600;
const EnergyClaimCooldownMs: u64 = 60 * 60 * 1000;

public struct AdminCap has key, store {
    id: sui::object::UID,
}

public struct Arena has key {
    id: sui::object::UID,
    admin: address,
    profiles: vector<Profile>,
    scenarios: vector<Scenario>,
}

public struct ArenaCreated has copy, drop {
    admin: address,
}

public struct BadgeClaimed has copy, drop {
    owner: address,
    badge_tier: u8,
}

public struct EnergyClaimed has copy, drop {
    owner: address,
    amount: u64,
}

public struct ScenarioCreated has copy, drop {
    scenario_id: u64,
}

public struct ScenarioLifecycleChanged has copy, drop {
    scenario_id: u64,
    state: u8,
}

public struct InsightAllocated has copy, drop {
    scenario_id: u64,
    owner: address,
    side: bool,
    energy_amount: u64,
}

public struct ScenarioSettled has copy, drop {
    scenario_id: u64,
    winning_side: bool,
}

public struct Profile has store, drop {
    owner: address,
    points: u64,
    energy: u64,
    badge_claimed: bool,
    badge_tier: u8,
    badge_xp: u64,
    nft_count: u64,
    correct_calls: u64,
    total_calls: u64,
    streak: u64,
    last_energy_claim_ms: std::option::Option<u64>,
}

public struct Allocation has store, drop {
    owner: address,
    side: bool,
    energy_amount: u64,
    created_at_ms: u64,
}

public struct Scenario has store, drop {
    scenario_id: u64,
    event_id: String,
    title: String,
    prompt: String,
    fighter_a_name: String,
    fighter_a_country: String,
    fighter_b_name: String,
    fighter_b_country: String,
    round: u64,
    open_at_ms: u64,
    lock_at_ms: u64,
    settle_by_ms: u64,
    state: u8,
    winning_side: Option<bool>,
    total_energy: u64,
    participant_count: u64,
    allocations: vector<Allocation>,
}

fun init(ctx: &mut sui::tx_context::TxContext) {
    let admin = sui::tx_context::sender(ctx);
    sui::transfer::transfer(AdminCap { id: sui::object::new(ctx) }, admin);
    sui::transfer::share_object(Arena {
        id: sui::object::new(ctx),
        admin,
        profiles: std::vector::empty(),
        scenarios: std::vector::empty(),
    });
    event::emit(ArenaCreated { admin });
}

public fun claim_badge(arena: &mut Arena, ctx: &sui::tx_context::TxContext) {
    let owner = sui::tx_context::sender(ctx);
    let profiles = &mut arena.profiles;
    let profile = borrow_or_create_profile(profiles, owner);

    if (profile.badge_claimed) {
        return
    };

    profile.badge_claimed = true;
    profile.badge_tier = TierWhite;
    profile.badge_xp = profile.badge_xp + 25;
    profile.nft_count = profile.nft_count + 1;

    event::emit(BadgeClaimed {
        owner,
        badge_tier: profile.badge_tier,
    });
}

public fun claim_energy(arena: &mut Arena, amount: u64, current_clock: &Clock, ctx: &sui::tx_context::TxContext) {
    let owner = sui::tx_context::sender(ctx);
    let now_ms = sui::clock::timestamp_ms(current_clock);
    let claim_amount = if (amount == 0) DefaultEnergyClaimAmount else amount;
    let profiles = &mut arena.profiles;
    let profile = borrow_or_create_profile(profiles, owner);

    assert!(profile.badge_claimed, EProfileNotClaimed);

    if (std::option::is_some(&profile.last_energy_claim_ms)) {
        let last_claim_ms = *std::option::borrow(&profile.last_energy_claim_ms);
        assert!(now_ms >= last_claim_ms + EnergyClaimCooldownMs, EEnergyClaimTooEarly);
        *std::option::borrow_mut(&mut profile.last_energy_claim_ms) = now_ms;
    } else {
        profile.last_energy_claim_ms = std::option::some(now_ms);
    };

    profile.energy = profile.energy + claim_amount;
    event::emit(EnergyClaimed { owner, amount: claim_amount });
}

public fun create_scenario(
    arena: &mut Arena,
    cap: &AdminCap,
    scenario_id: u64,
    event_id: String,
    title: String,
    prompt: String,
    fighter_a_name: String,
    fighter_a_country: String,
    fighter_b_name: String,
    fighter_b_country: String,
    round: u64,
    open_at_ms: u64,
    lock_at_ms: u64,
    settle_by_ms: u64,
    current_clock: &Clock,
    ctx: &sui::tx_context::TxContext,
) {
    assert_admin(arena, cap, ctx);

    let now_ms = sui::clock::timestamp_ms(current_clock);
    let state = compute_initial_state(open_at_ms, lock_at_ms, now_ms);

    std::vector::push_back(&mut arena.scenarios, Scenario {
        scenario_id,
        event_id,
        title,
        prompt,
        fighter_a_name,
        fighter_a_country,
        fighter_b_name,
        fighter_b_country,
        round,
        open_at_ms,
        lock_at_ms,
        settle_by_ms,
        state,
        winning_side: std::option::none(),
        total_energy: 0,
        participant_count: 0,
        allocations: std::vector::empty(),
    });

    event::emit(ScenarioCreated { scenario_id });
}

public fun publish_scenario(
    arena: &mut Arena,
    cap: &AdminCap,
    scenario_id: u64,
    current_clock: &Clock,
    ctx: &sui::tx_context::TxContext,
) {
    assert_admin(arena, cap, ctx);

    let now_ms = sui::clock::timestamp_ms(current_clock);
    let scenario = borrow_scenario_mut(&mut arena.scenarios, scenario_id);
    assert!(scenario.state != StateSettled && scenario.state != StateArchived, EScenarioCannotPublish);

    let original_window_ms = max_u64(scenario.lock_at_ms - scenario.open_at_ms, MinScenarioWindowMs);
    scenario.open_at_ms = now_ms;
    scenario.lock_at_ms = now_ms + original_window_ms;
    scenario.settle_by_ms = scenario.lock_at_ms + DefaultSettlementWindowMs;
    scenario.state = StateOpen;

    event::emit(ScenarioLifecycleChanged {
        scenario_id,
        state: scenario.state,
    });
}

public fun lock_scenario(
    arena: &mut Arena,
    cap: &AdminCap,
    scenario_id: u64,
    current_clock: &Clock,
    ctx: &sui::tx_context::TxContext,
) {
    assert_admin(arena, cap, ctx);

    let now_ms = sui::clock::timestamp_ms(current_clock);
    let scenario = borrow_scenario_mut(&mut arena.scenarios, scenario_id);
    assert!(scenario.state == StateDraft || scenario.state == StateOpen, EScenarioCannotLock);

    scenario.lock_at_ms = now_ms;
    scenario.settle_by_ms = now_ms + DefaultSettlementWindowMs;
    scenario.state = StateLocked;

    event::emit(ScenarioLifecycleChanged {
        scenario_id,
        state: scenario.state,
    });
}

public fun archive_scenario(
    arena: &mut Arena,
    cap: &AdminCap,
    scenario_id: u64,
    _current_clock: &Clock,
    ctx: &sui::tx_context::TxContext,
) {
    assert_admin(arena, cap, ctx);

    let scenario = borrow_scenario_mut(&mut arena.scenarios, scenario_id);
    assert!(scenario.state != StateOpen, EScenarioCannotArchive);
    scenario.state = StateArchived;

    event::emit(ScenarioLifecycleChanged {
        scenario_id,
        state: scenario.state,
    });
}

public fun allocate_insight(
    arena: &mut Arena,
    scenario_id: u64,
    side: bool,
    energy_amount: u64,
    current_clock: &Clock,
    ctx: &sui::tx_context::TxContext,
) {
    let owner = sui::tx_context::sender(ctx);
    let now_ms = sui::clock::timestamp_ms(current_clock);
    let profiles = &mut arena.profiles;
    let scenarios = &mut arena.scenarios;
    let profile = borrow_or_create_profile(profiles, owner);
    let scenario = borrow_scenario_mut(scenarios, scenario_id);

    assert!(profile.badge_claimed, EProfileNotClaimed);
    assert!(profile.energy >= energy_amount, EInsufficientEnergy);
    assert!(
        scenario.state == StateOpen && now_ms >= scenario.open_at_ms && now_ms < scenario.lock_at_ms,
        EScenarioNotOpen
    );

    if (!has_allocation_from(&scenario.allocations, owner)) {
        scenario.participant_count = scenario.participant_count + 1;
    };

    profile.energy = profile.energy - energy_amount;
    scenario.total_energy = scenario.total_energy + energy_amount;
    std::vector::push_back(&mut scenario.allocations, Allocation {
        owner,
        side,
        energy_amount,
        created_at_ms: now_ms,
    });

    event::emit(InsightAllocated {
        scenario_id,
        owner,
        side,
        energy_amount,
    });
}

public fun settle_scenario(
    arena: &mut Arena,
    cap: &AdminCap,
    scenario_id: u64,
    winning_side: bool,
    _current_clock: &Clock,
    ctx: &sui::tx_context::TxContext,
) {
    assert_admin(arena, cap, ctx);

    let profiles = &mut arena.profiles;
    let scenarios = &mut arena.scenarios;
    let scenario = borrow_scenario_mut(scenarios, scenario_id);
    assert!(scenario.state != StateArchived, EScenarioCannotSettle);

    if (scenario.state == StateSettled) {
        return
    };

    assert!(scenario.state == StateOpen || scenario.state == StateLocked, EScenarioCannotSettle);

    scenario.state = StateSettled;
    scenario.winning_side = std::option::some(winning_side);

    let allocation_count = std::vector::length(&scenario.allocations);
    let mut i = 0;
    while (i < allocation_count) {
        let allocation = std::vector::borrow(&scenario.allocations, i);
        let profile = borrow_or_create_profile(profiles, allocation.owner);
        profile.total_calls = profile.total_calls + 1;

        if (allocation.side == winning_side) {
            profile.points = profile.points + (allocation.energy_amount * 2);
            profile.badge_xp = profile.badge_xp + xp_award(allocation.energy_amount);
            profile.correct_calls = profile.correct_calls + 1;
            profile.streak = profile.streak + 1;
        } else {
            profile.streak = 0;
        };

        profile.badge_tier = badge_tier_from_xp(profile.badge_xp);
        i = i + 1;
    };

    event::emit(ScenarioSettled {
        scenario_id,
        winning_side,
    });
}

fun assert_admin(arena: &Arena, _cap: &AdminCap, ctx: &sui::tx_context::TxContext) {
    assert!(arena.admin == sui::tx_context::sender(ctx), ENotAdmin);
}

fun compute_initial_state(open_at_ms: u64, lock_at_ms: u64, now_ms: u64): u8 {
    if (now_ms < open_at_ms) {
        StateDraft
    } else if (now_ms < lock_at_ms) {
        StateOpen
    } else {
        StateLocked
    }
}

fun borrow_or_create_profile(profiles: &mut vector<Profile>, owner: address): &mut Profile {
    let profile_idx = profile_index(profiles, owner);

    if (std::option::is_some(&profile_idx)) {
        std::vector::borrow_mut(profiles, std::option::destroy_some(profile_idx))
    } else {
        std::vector::push_back(profiles, Profile {
            owner,
            points: 1_250,
            energy: 0,
            badge_claimed: false,
            badge_tier: TierWhite,
            badge_xp: 0,
            nft_count: 0,
            correct_calls: 0,
            total_calls: 0,
            streak: 0,
            last_energy_claim_ms: std::option::none(),
        });
        let last_idx = std::vector::length(profiles) - 1;
        std::vector::borrow_mut(profiles, last_idx)
    }
}

fun borrow_scenario_mut(scenarios: &mut vector<Scenario>, scenario_id: u64): &mut Scenario {
    let idx_opt = scenario_index(scenarios, scenario_id);
    assert!(std::option::is_some(&idx_opt), EScenarioNotFound);
    std::vector::borrow_mut(scenarios, std::option::destroy_some(idx_opt))
}

fun profile_index(profiles: &vector<Profile>, owner: address): std::option::Option<u64> {
    let len = std::vector::length(profiles);
    let mut i = 0;
    while (i < len) {
        let profile = std::vector::borrow(profiles, i);
        if (profile.owner == owner) {
            return std::option::some(i)
        };
        i = i + 1;
    };

    std::option::none()
}

fun scenario_index(scenarios: &vector<Scenario>, scenario_id: u64): std::option::Option<u64> {
    let len = std::vector::length(scenarios);
    let mut i = 0;
    while (i < len) {
        let scenario = std::vector::borrow(scenarios, i);
        if (scenario.scenario_id == scenario_id) {
            return std::option::some(i)
        };
        i = i + 1;
    };

    std::option::none()
}

fun has_allocation_from(allocations: &vector<Allocation>, owner: address): bool {
    let len = std::vector::length(allocations);
    let mut i = 0;
    while (i < len) {
        let allocation = std::vector::borrow(allocations, i);
        if (allocation.owner == owner) {
            return true
        };
        i = i + 1;
    };

    false
}

fun badge_tier_from_xp(xp: u64): u8 {
    if (xp >= 900) {
        TierBlack
    } else if (xp >= 600) {
        TierBrown
    } else if (xp >= 350) {
        TierPurple
    } else if (xp >= 180) {
        TierBlue
    } else {
        TierWhite
    }
}

fun xp_award(amount: u64): u64 {
    let scaled = amount / 2;
    if (scaled < 20) 20 else scaled
}

fun max_u64(left: u64, right: u64): u64 {
    if (left > right) left else right
}
