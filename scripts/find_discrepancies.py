import openpyxl
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db import run_query

wb = openpyxl.load_workbook('PS.HOV_Work_Tracker.xlsx', data_only=True)
sheet = wb['Objectives by Ventures']

# Fetch all objectives from database
db_objs = run_query("""
SELECT o.id, o.sl_no, o.title, o.owner_id, p.full_name as owner_name, o.due_date, v.name as venture_name
FROM public.objectives o
JOIN public.ventures v ON o.venture_id = v.id
LEFT JOIN public.profiles p ON o.owner_id = p.id
ORDER BY v.display_order, o.sl_no;
""")

# Map db_objs by (venture_name, sl_no)
db_map = {(o['venture_name'].strip(), o['sl_no']): o for o in db_objs}

col = 1
excel_objs = []
while col <= sheet.max_column:
    vname = sheet.cell(1, col).value
    if vname and str(vname).strip():
        vname = str(vname).strip()
        for r in range(4, sheet.max_row + 1):
            sl = sheet.cell(r, col).value
            title = sheet.cell(r, col+1).value
            owner = sheet.cell(r, col+4).value
            due = sheet.cell(r, col+5).value
            if sl is not None and title is not None and str(title).strip():
                if isinstance(sl, (int, float)) and int(sl) < 50:
                    excel_objs.append({
                        'venture': vname,
                        'sl_no': int(sl),
                        'title': str(title).strip(),
                        'owner': str(owner).strip() if owner else None,
                        'due': str(due)[:10] if due else None
                    })
    col += 8

print(f"Total Excel objectives: {len(excel_objs)}")
print(f"Total DB objectives: {len(db_objs)}")

discrepancies = []
for eo in excel_objs:
    key = (eo['venture'], eo['sl_no'])
    dbo = db_map.get(key)
    if not dbo:
        discrepancies.append(f"Missing in DB: {key}")
    else:
        diff = []
        if eo['owner'] and dbo['owner_name'] != eo['owner']:
            diff.append(f"Owner: Excel='{eo['owner']}' vs DB='{dbo['owner_name']}'")
        if eo['due'] and str(dbo['due_date'])[:10] != eo['due']:
            diff.append(f"DueDate: Excel='{eo['due']}' vs DB='{dbo['due_date']}'")
        if diff:
            discrepancies.append(f"{eo['venture']} #{eo['sl_no']} '{eo['title'][:35]}': {'; '.join(diff)}")

print(f"\nDiscrepancies found ({len(discrepancies)}):")
for d in discrepancies:
    print(f"  - {d}")
