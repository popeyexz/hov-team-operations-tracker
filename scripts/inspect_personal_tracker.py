import openpyxl

wb = openpyxl.load_workbook('HOV Peronal Tasks Tracker.xlsx', data_only=True)
for sheet_name in wb.sheetnames:
    print(f"=== SHEET: {sheet_name} ===")
    sheet = wb[sheet_name]
    for r in range(1, min(30, sheet.max_row + 1)):
        row_vals = [sheet.cell(r, c).value for c in range(1, min(15, sheet.max_column + 1))]
        if any(v is not None for v in row_vals):
            print(f"Row {r}: {row_vals}")
