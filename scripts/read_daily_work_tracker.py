import openpyxl

wb = openpyxl.load_workbook('HOV Peronal Tasks Tracker.xlsx', data_only=True)
sheet = wb['Daily Work Tracker']
print(f"Max rows: {sheet.max_row}, Max cols: {sheet.max_column}")

# Header row 1 & 2
headers_r1 = [sheet.cell(1, c).value for c in range(1, sheet.max_column + 1)]
headers_r2 = [sheet.cell(2, c).value for c in range(1, sheet.max_column + 1)]
print(f"Row 1: {headers_r1}")
print(f"Row 2: {headers_r2}")

items_found = []
for r in range(3, sheet.max_row + 1):
    date_val = sheet.cell(r, 1).value
    day_val = sheet.cell(r, 2).value
    for c in range(3, sheet.max_column + 1):
        cell_val = sheet.cell(r, c).value
        if cell_val is not None and str(cell_val).strip():
            # Find who this column belongs to
            col_owner = headers_r1[c-1] or headers_r1[c-2] or f"Col_{c}"
            items_found.append({
                'row': r,
                'date': str(date_val),
                'day': day_val,
                'col': c,
                'owner': col_owner,
                'task': str(cell_val).strip()
            })

print(f"\nTotal action items found in 'Daily Work Tracker': {len(items_found)}")
for item in items_found:
    print(item)
