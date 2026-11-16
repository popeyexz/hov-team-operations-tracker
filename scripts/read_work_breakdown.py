import openpyxl

wb = openpyxl.load_workbook('HOV Peronal Tasks Tracker.xlsx', data_only=True)
sheet = wb['PS.HOV (Work breakdown)']
print(f"Max rows: {sheet.max_row}, Max cols: {sheet.max_column}")

col = 1
while col <= sheet.max_column:
    vname = sheet.cell(1, col).value
    lead = sheet.cell(2, col).value
    if vname:
        print(f"\n--- VENTURE: {vname} (Lead: {lead}) [Col {col}] ---")
        for r in range(4, sheet.max_row + 1):
            sl = sheet.cell(r, col).value
            task = sheet.cell(r, col+1).value
            status = sheet.cell(r, col+2).value
            owner = sheet.cell(r, col+3).value
            if task:
                print(f"  Task {sl}: {task} | Status: {status} | Owner: {owner}")
    col += 1
