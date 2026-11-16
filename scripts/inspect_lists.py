import openpyxl

wb = openpyxl.load_workbook('PS.HOV_Work_Tracker.xlsx', data_only=True)
lists_sheet = wb['Lists']

print("--- Lists Sheet ---")
for r in range(1, 40):
    vals = [lists_sheet.cell(r, c).value for c in range(1, 10)]
    if any(vals):
        print(f"Row {r}: {vals}")
