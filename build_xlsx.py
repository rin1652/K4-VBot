#!/usr/bin/env python3
"""Build G03_baogia.xlsx by invoking the artifact-tool workbook builder."""
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parent
runtime_node = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if not runtime_node.exists():
    runtime_node = Path("node")
cmd = [str(runtime_node), str(ROOT / "build_xlsx.mjs")]
raise SystemExit(subprocess.call(cmd, cwd=ROOT))
