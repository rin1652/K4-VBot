#!/usr/bin/env python3
"""Sizing for VBot Workplace baseline.

The script keeps all assumptions in one place so the team can change traffic,
token mix, or peak factor and regenerate the sizing table used in the deck.
"""
from __future__ import annotations

from dataclasses import dataclass


DAU = 2_000
WORK_DAYS = 22
REQ_PER_USER_DAY = 40
HOURS_PER_DAY = 10
PEAK_FACTOR = 3
SANDBOX_RUNS = 400_000
SANDBOX_SECONDS = 30
IMAGES = 90_000
STORAGE_GB_PER_USER = 3


@dataclass(frozen=True)
class Tier:
    name: str
    share: float
    input_tokens: int
    output_tokens: int


TIERS = [
    Tier("Cấp 1", 0.45, 3_000, 400),
    Tier("Cấp 2", 0.25, 4_000, 600),
    Tier("Cấp 3", 0.15, 4_500, 700),
    Tier("Cấp 4", 0.10, 5_000, 800),
    Tier("Cấp 5", 0.05, 5_500, 900),
]


def main() -> None:
    requests = DAU * WORK_DAYS * REQ_PER_USER_DAY
    avg_in = sum(t.share * t.input_tokens for t in TIERS)
    avg_out = sum(t.share * t.output_tokens for t in TIERS)
    input_tokens = requests * avg_in
    output_tokens = requests * avg_out
    office_seconds = WORK_DAYS * HOURS_PER_DAY * 3600
    avg_rps = requests / office_seconds
    peak_rps = avg_rps * PEAK_FACTOR
    sandbox_hours = SANDBOX_RUNS * SANDBOX_SECONDS / 3600
    storage_gb = DAU * STORAGE_GB_PER_USER

    print("VBot Workplace sizing | baseline")
    print("Metric\tValue\tFormula")
    print(f"Monthly requests\t{requests:,.0f}\t{DAU:,} DAU × {WORK_DAYS} days × {REQ_PER_USER_DAY} requests/user/day")
    print(f"Weighted input tokens/request\t{avg_in:,.1f}\tΣ(tier share × input tokens/tier)")
    print(f"Weighted output tokens/request\t{avg_out:,.1f}\tΣ(tier share × output tokens/tier)")
    print(f"Monthly input tokens\t{input_tokens:,.0f}\t{requests:,.0f} × {avg_in:,.1f}")
    print(f"Monthly output tokens\t{output_tokens:,.0f}\t{requests:,.0f} × {avg_out:,.1f}")
    print(f"Average office rps\t{avg_rps:.2f}\t{requests:,.0f} ÷ ({WORK_DAYS} × {HOURS_PER_DAY} × 3,600)")
    print(f"Peak rps\t{peak_rps:.2f}\t{avg_rps:.2f} × {PEAK_FACTOR}")
    print(f"Sandbox task-hours/month\t{sandbox_hours:,.1f}\t{SANDBOX_RUNS:,} × {SANDBOX_SECONDS}s ÷ 3,600")
    print(f"Images/month\t{IMAGES:,.0f}\tbaseline")
    print(f"Object storage\t{storage_gb:,.0f} GB\t{DAU:,} users × {STORAGE_GB_PER_USER} GB/user")
    print("\nTier\tShare\tInput/request\tOutput/request\tMonthly requests\tMonthly input\tMonthly output")
    for tier in TIERS:
        tier_requests = requests * tier.share
        print(f"{tier.name}\t{tier.share:.0%}\t{tier.input_tokens:,}\t{tier.output_tokens:,}\t{tier_requests:,.0f}\t{tier_requests*tier.input_tokens:,.0f}\t{tier_requests*tier.output_tokens:,.0f}")


if __name__ == "__main__":
    main()
