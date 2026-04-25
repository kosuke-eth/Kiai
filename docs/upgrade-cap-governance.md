# Upgrade Capability Governance

KIAI's current testnet package was published with a live `UpgradeCap`:

- package: `0x6ee68a1d8f06564d0625f0c4460f6801207529de93a77a91d4c4efb9b809f976`
- upgrade cap: `0xa1b65f594c0648fbe54b9f2f6b21a23a842cfe388926696879e26f5aaa1881c0`

This is an onchain governance decision, not a frontend bug. The relevant Sui options are:

## Option 1: Keep the cap for hackathon iteration

Use this if you still expect to patch the Move package after demos or judging.

- Move the cap to a dedicated cold wallet, not the day-to-day deployer.
- Record who controls it and where the recovery phrase or key lives.
- Treat the package as mutable in all docs and judge-facing materials.

## Option 2: Lock the package now

Use this if you want maximum trust for the current published package and do not need further Move upgrades.

Sui exposes `0x2::package::make_immutable`, which destroys the `UpgradeCap` and permanently locks the package.

Preview the exact command with:

```bash
./scripts/lock-testnet-package.sh
```

Execute it with:

```bash
./scripts/lock-testnet-package.sh --execute
```

This action is irreversible.

## Option 3: Publish the next package under a stricter policy

If you need one more upgrade window but want tighter guarantees, publish the next version behind a custom wrapper policy and then transfer control to a more constrained cap.

Per the official Sui docs, the standard framework supports helper policies such as:

- additive-only upgrades
- dependency-only upgrades
- fully immutable packages

For this hackathon repo, the practical choice is usually either:

- keep the current cap in cold storage until the demo is over, then make the package immutable
- or make it immutable immediately if the contract is final
