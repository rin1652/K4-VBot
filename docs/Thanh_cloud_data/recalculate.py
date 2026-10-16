"""Standalone Python 3 recalculation; no third-party dependencies or network.
Run: python recalculate.py. Edit bill_of_materials.json q/q4 to simulate usage.
PENDING entries are deliberately excluded; this prints a subtotal, never total bill.
"""
from pathlib import Path
from decimal import Decimal
from collections import defaultdict
import csv
import json

root=Path(__file__).resolve().parent
rows=json.loads((root/'bill_of_materials.json').read_text(encoding='utf8'))
totals=[]
for qkey,name in [('q','2000'),('q4','4000')]:
    groups=defaultdict(Decimal)
    total=Decimal(0)
    for row in rows:
        cost=Decimal(row['price'])*Decimal(row[qkey])
        groups[row['component']]+=cost
        total+=cost
    print(name+' DAU')
    for component,cost in groups.items():
        print(f'  {component}: {cost:.4f} USD')
    print(f'  SUBTOTAL priced: {total:.4f} USD/month + PENDING')
    totals.append(total)
    with (root/f'Thanh_cost_{name}.tsv').open(encoding='utf-8-sig',newline='') as f:
        exported=list(csv.reader(f,delimiter='\t'))
    assert all(len(row)==5 for row in exported)
    old_total=Decimal(exported[-1][3])
    if abs(old_total-total)>Decimal('.0001'):
        print('  Usage changed: exported TSV must be regenerated.')
print(f'Delta: {totals[1]-totals[0]:.4f} USD/month')
