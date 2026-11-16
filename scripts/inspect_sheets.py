import openpyxl

wb = openpyxl.load_workbook('PS.HOV_Work_Tracker.xlsx', data_only=True)
kr_sheet = wb['Key Results by Ventures']

print("--- Key Results by Ventures ---")
for col_idx in range(1, 100, 8):
    venture = kr_sheet.cell(1, col_idx).value
    if not venture:
        continue
    items = 0
    for r in range(4, 50):
        code = kr_sheet.cell(r, col_idx).value
        title = kr_sheet.cell(r, col_idx + 1).value
        if title:
            items += 1
            if items <= 3:
                print(f"  [{venture}] {code}: {title}")
    print(f"Venture {venture}: {items} key results")
