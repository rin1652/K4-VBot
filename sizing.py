#!/usr/bin/env python3
"""VBot Workplace workload sizing.

``request`` means one user request.  ``model_call`` means one LLM API call.
Token totals are calculated from model calls, not from an agent-step multiplier.
The token and call values below are planning assumptions until production
telemetry is available.
"""
from __future__ import annotations

from dataclasses import dataclass
from math import isclose
from typing import Iterable


DAU = 2_000
WORK_DAYS = 22
REQ_PER_USER_DAY = 40
HOURS_PER_DAY = 10
PEAK_FACTOR = 3
SANDBOX_RUNS = 400_000
SANDBOX_SECONDS = 30
IMAGES = 90_000
PRODUCTION_STORAGE_GB = DAU * 3
STAGING_STORAGE_GB = 100


@dataclass(frozen=True)
class Tier:
    name: str
    share: float
    input_tokens_per_call: int
    output_tokens_per_call: int
    model_calls_per_request: float


TIERS = [
    Tier("Cấp 1", 0.45, 3_000, 400, 1.0),
    Tier("Cấp 2", 0.25, 4_000, 600, 1.0),
    Tier("Cấp 3", 0.15, 4_500, 700, 2.0),
    Tier("Cấp 4", 0.10, 5_000, 800, 3.0),
    Tier("Cấp 5", 0.05, 5_500, 900, 1.0),
]

PROCESSING_TYPES = {
    "Cấp 1": "Nova Micro + RAG",
    "Cấp 2": "Nova Lite + DOCX/XLSX/PPTX pipeline",
    "Cấp 3": "Nova Lite + sandbox; Agent khi cần",
    "Cấp 4": "Nova Pro + connectors/tools",
    "Cấp 5": "Nova Lite + image/pipeline; ảnh tính riêng",
}


def monthly_requests() -> int:
    return DAU * WORK_DAYS * REQ_PER_USER_DAY


def validate_tiers(tiers: Iterable[Tier]) -> None:
    tiers = list(tiers)
    if not tiers:
        raise ValueError("TIERS must not be empty")
    if not isclose(sum(t.share for t in tiers), 1.0, abs_tol=1e-9):
        raise ValueError("Tier shares must sum to 100%")
    for tier in tiers:
        if tier.share < 0 or tier.input_tokens_per_call < 0 or tier.output_tokens_per_call < 0:
            raise ValueError(f"Negative sizing value in {tier.name}")
        if tier.model_calls_per_request < 0:
            raise ValueError(f"Negative model call count in {tier.name}")


def tier_rows(tiers: Iterable[Tier] = TIERS) -> list[dict[str, float | int | str]]:
    validate_tiers(tiers)
    requests = monthly_requests()
    rows = []
    for tier in tiers:
        tier_requests = requests * tier.share
        tier_model_calls = tier_requests * tier.model_calls_per_request
        rows.append(
            {
                "tier": tier.name,
                "share": tier.share,
                "processing_type": PROCESSING_TYPES.get(tier.name, "LLM pipeline"),
                "monthly_requests": tier_requests,
                "model_calls_per_request": tier.model_calls_per_request,
                "monthly_model_calls": tier_model_calls,
                "input_tokens_per_call": tier.input_tokens_per_call,
                "output_tokens_per_call": tier.output_tokens_per_call,
                "billable_input_tokens": tier_model_calls * tier.input_tokens_per_call,
                "billable_output_tokens": tier_model_calls * tier.output_tokens_per_call,
            }
        )
    return rows


def totals(tiers: Iterable[Tier] = TIERS) -> dict[str, float | int]:
    rows = tier_rows(tiers)
    requests = monthly_requests()
    office_seconds = WORK_DAYS * HOURS_PER_DAY * 3_600
    result = {
        "monthly_user_requests": requests,
        "monthly_model_calls": sum(r["monthly_model_calls"] for r in rows),
        "billable_input_tokens": sum(r["billable_input_tokens"] for r in rows),
        "billable_output_tokens": sum(r["billable_output_tokens"] for r in rows),
        "average_request_rps": requests / office_seconds,
        "peak_request_rps": requests / office_seconds * PEAK_FACTOR,
        "average_model_calls_per_second": sum(r["monthly_model_calls"] for r in rows) / office_seconds,
        "peak_model_calls_per_second": sum(r["monthly_model_calls"] for r in rows) / office_seconds * PEAK_FACTOR,
        "sandbox_task_hours": SANDBOX_RUNS * SANDBOX_SECONDS / 3_600,
        "images_month": IMAGES,
        "production_storage_gb": PRODUCTION_STORAGE_GB,
        "staging_storage_gb": STAGING_STORAGE_GB,
        "total_storage_gb": PRODUCTION_STORAGE_GB + STAGING_STORAGE_GB,
    }
    if not isclose(result["monthly_user_requests"], sum(r["monthly_requests"] for r in rows)):
        raise AssertionError("Tier request total does not equal system request total")
    return result


def _fmt(value: float | int) -> str:
    return f"{value:,.0f}" if float(value).is_integer() else f"{value:,.2f}"


def main() -> None:
    validate_tiers(TIERS)
    data = totals()
    print("VBot Workplace sizing | baseline assumptions")
    print("All token/call values are estimates until production telemetry is available.")
    print("Metric\tValue\tFormula")
    formulas = {
        "monthly_user_requests": f"{DAU:,} DAU × {WORK_DAYS} days × {REQ_PER_USER_DAY} requests/user/day",
        "monthly_model_calls": "Σ(tier requests × model calls/request)",
        "billable_input_tokens": "Σ(tier model calls × input tokens/call)",
        "billable_output_tokens": "Σ(tier model calls × output tokens/call)",
        "average_request_rps": f"requests ÷ ({WORK_DAYS} × {HOURS_PER_DAY} × 3,600)",
        "peak_request_rps": f"average request RPS × {PEAK_FACTOR}",
        "average_model_calls_per_second": "monthly model calls ÷ office seconds",
        "peak_model_calls_per_second": f"average model calls/second × {PEAK_FACTOR}",
        "sandbox_task_hours": f"{SANDBOX_RUNS:,} × {SANDBOX_SECONDS}s ÷ 3,600",
        "images_month": "baseline assumption",
        "production_storage_gb": f"{DAU:,} users × 3 GB/user",
        "staging_storage_gb": "baseline staging allocation",
        "total_storage_gb": "production storage + staging storage",
    }
    labels = {
        "monthly_user_requests": "Monthly user requests",
        "monthly_model_calls": "Monthly LLM model calls",
        "billable_input_tokens": "Monthly billable input tokens",
        "billable_output_tokens": "Monthly billable output tokens",
        "average_request_rps": "Average request RPS",
        "peak_request_rps": "Peak request RPS",
        "average_model_calls_per_second": "Average model calls/second",
        "peak_model_calls_per_second": "Peak model calls/second",
        "sandbox_task_hours": "Sandbox task-hours",
        "images_month": "Images/month",
        "production_storage_gb": "Production storage",
        "staging_storage_gb": "Staging storage",
        "total_storage_gb": "Total storage",
    }
    for key, label in labels.items():
        print(f"{label}\t{_fmt(data[key])}\t{formulas[key]}")

    print("\nTier\tShare\tProcessing Type\tMonthly Requests\tModel Calls/Request\tMonthly Model Calls\tInput Tokens/Call\tOutput Tokens/Call\tBillable Input Tokens\tBillable Output Tokens")
    for row in tier_rows():
        print(
            f"{row['tier']}\t{row['share']:.0%}\t{row['processing_type']}\t"
            f"{_fmt(row['monthly_requests'])}\t{row['model_calls_per_request']:.1f}\t"
            f"{_fmt(row['monthly_model_calls'])}\t{_fmt(row['input_tokens_per_call'])}\t"
            f"{_fmt(row['output_tokens_per_call'])}\t{_fmt(row['billable_input_tokens'])}\t"
            f"{_fmt(row['billable_output_tokens'])}"
        )


if __name__ == "__main__":
    main()
