"""Local equivalent checks for the capstone workbook and submission artifacts."""
from __future__ import annotations

import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
FORBIDDEN = re.compile(r"free tier|free trial|trial|free credits|promotional credits|startup credits|miễn phí|dùng thử|khuyến mãi", re.I)
REQUIRED = {"compute", "llm", "gateway", "load_balancer", "authn", "authz", "database", "vector_db", "object_storage", "cache_queue", "sandbox", "connectors", "secrets_kms", "backup_dr", "monitoring", "governance", "network", "cicd", "ops_labor"}


def xlsx_rows(path: Path):
    with zipfile.ZipFile(path) as zf:
        strings = []
        if "xl/sharedStrings.xml" in zf.namelist():
            root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
            for si in root.findall("x:si", NS):
                strings.append("".join(t.text or "" for t in si.iterfind(".//x:t", NS)))
        root = ET.fromstring(zf.read("xl/worksheets/sheet1.xml"))
        rows = []
        for row in root.findall(".//x:sheetData/x:row", NS):
            cells = {}
            for c in row.findall("x:c", NS):
                ref = c.attrib["r"]
                col = re.match(r"[A-Z]+", ref).group()
                value = c.find("x:v", NS)
                text = "" if value is None else (value.text or "")
                if c.attrib.get("t") == "s":
                    text = strings[int(text)]
                cells[col] = text
            rows.append([cells.get(chr(ord("A") + i), "") for i in range(5)])
        return rows


def main() -> int:
    path = Path(sys.argv[1] if len(sys.argv) > 1 else "G03_baogia.xlsx")
    errors = []
    rows = xlsx_rows(path)
    expected = ["Component", "Ý nghĩa", "Ghi chú", "Chi phí/tháng (USD)", "Bằng chứng"]
    if rows[0] != expected:
        errors.append(f"header mismatch: {rows[0]}")
    items = rows[1:-1]
    comps = {r[0] for r in items}
    missing = REQUIRED - comps
    if missing:
        errors.append(f"missing components: {sorted(missing)}")
    evidence = set(re.findall(r"\bE\d{2,3}\b", "\n".join("\t".join(r) for r in rows)))
    with zipfile.ZipFile(path) as zf:
        media = [n for n in zf.namelist() if n.startswith("xl/media/")]
    for idx, row in enumerate(items, start=2):
        if len(row) != 5:
            errors.append(f"row {idx}: wrong column count")
        if len(row[2]) < 15:
            errors.append(f"row {idx}: note too short")
        try:
            cost = float(row[3])
        except ValueError:
            errors.append(f"row {idx}: nonnumeric cost {row[3]!r}")
            continue
        if cost < 0:
            errors.append(f"row {idx}: negative cost")
        if cost == 0 and not re.search(r"included|nằm trong|đã bao gồm|bao gồm trong", row[2], re.I):
            errors.append(f"row {idx}: zero cost has no inclusion explanation")
        if FORBIDDEN.search("\t".join(row)):
            errors.append(f"row {idx}: forbidden pricing text")
    total = float(rows[-1][3])
    subtotal = sum(float(r[3]) for r in items)
    if abs(total - subtotal) > 0.01:
        errors.append(f"TOTAL mismatch: {total} vs {subtotal}")
    if "TOTAL" not in rows[-1][0]:
        errors.append("TOTAL is not last row")
    if len(media) < 20:
        errors.append(f"too few embedded evidence images: {len(media)}")
    print(f"rows={len(items)} components={len(comps)} evidence_ids={len(evidence)} media={len(media)} total={total:.2f}")
    if errors:
        print("FAIL local validator")
        for error in errors:
            print("-", error)
        return 1
    print("PASS local validator")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
