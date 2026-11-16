import openpyxl

wb_personal = openpyxl.load_workbook('HOV Peronal Tasks Tracker.xlsx', data_only=True)
wb_ops = openpyxl.load_workbook('PS.HOV_Work_Tracker.xlsx', data_only=True)

print("=== SHEETS IN PERSONAL TRACKER ===")
for s in wb_personal.sheetnames:
    print(f" - {s}")

print("\n=== SHEETS IN OPS WORK TRACKER ===")
for s in wb_ops.sheetnames:
    print(f" - {s}")

sheet_p = wb_personal['PS.HOV (Work breakdown)']
sheet_o = wb_ops['Objectives by Ventures']

# Map columns for personal tracker
p_ventures = {}
for c in range(1, sheet_p.max_column + 1):
    v = sheet_p.cell(1, c).value
    lead = sheet_p.cell(2, c).value
    if v and str(v).strip():
        name = str(v).strip()
        tasks = []
        for r in range(4, sheet_p.max_row + 1):
            sl = sheet_p.cell(r, c).value
            task = sheet_p.cell(r, c+1).value
            status = sheet_p.cell(r, c+2).value
            owner = sheet_p.cell(r, c+3).value
            if task and str(task).strip():
                tasks.append({
                    'sl': sl,
                    'task': str(task).strip(),
                    'status': status,
                    'owner': owner
                })
        p_ventures[name] = {'lead': lead, 'tasks': tasks}

# Map columns for ops tracker
o_ventures = {}
for c in range(1, sheet_o.max_column + 1):
    v = sheet_o.cell(1, c).value
    lead = sheet_o.cell(2, c).value
    if v and str(v).strip():
        name = str(v).strip()
        tasks = []
        for r in range(4, sheet_o.max_row + 1):
            sl = sheet_o.cell(r, c).value
            task = sheet_o.cell(r, c+1).value
            status = sheet_o.cell(r, c+2).value
            owner = sheet_o.cell(r, c+4).value
            due = sheet_o.cell(r, c+5).value
            comments = sheet_o.cell(r, c+6).value
            if task and str(task).strip():
                tasks.append({
                    'sl': sl,
                    'task': str(task).strip(),
                    'status': status,
                    'owner': owner,
                    'due': due,
                    'comments': comments
                })
        o_ventures[name] = {'lead': lead, 'tasks': tasks}

print("\n=== VENTURE LIST COMPARISON ===")
print(f"Personal Tracker Ventures ({len(p_ventures)}): {list(p_ventures.keys())}")
print(f"Ops Tracker Ventures ({len(o_ventures)}): {list(o_ventures.keys())}")

all_v_names = set(p_ventures.keys()).union(set(o_ventures.keys()))
for vname in sorted(all_v_names):
    p_data = p_ventures.get(vname)
    o_data = o_ventures.get(vname)
    print(f"\n---------------------------------------------")
    print(f"VENTURE: '{vname}'")
    if not p_data:
        print("  -> MISSING in Personal Tracker!")
    elif not o_data:
        print("  -> MISSING in Ops Tracker!")
    else:
        p_tasks = p_data['tasks']
        o_tasks = o_data['tasks']
        print(f"  Personal Tasks: {len(p_tasks)} | Ops Tasks: {len(o_tasks)}")
        print(f"  Personal Lead: {p_data['lead']} | Ops Lead: {o_data['lead']}")
        
        # Check differences
        max_len = max(len(p_tasks), len(o_tasks))
        for i in range(max_len):
            pt = p_tasks[i] if i < len(p_tasks) else None
            ot = o_tasks[i] if i < len(o_tasks) else None
            diffs = []
            if not pt:
                diffs.append(f"Only in Ops: {ot['task'][:50]}")
            elif not ot:
                diffs.append(f"Only in Personal: {pt['task'][:50]}")
            else:
                if pt['task'].replace('\n', ' ').strip() != ot['task'].replace('\n', ' ').strip():
                    diffs.append(f"Text mismatch: P='{pt['task'][:30]}' vs O='{ot['task'][:30]}'")
                if (pt['owner'] or '').strip() != (ot['owner'] or '').strip():
                    diffs.append(f"Owner: P='{pt['owner']}' vs O='{ot['owner']}'")
                if (pt['status'] or '').strip() != (ot['status'] or '').strip():
                    diffs.append(f"Status: P='{pt['status']}' vs O='{ot['status']}'")
            if diffs:
                print(f"    Item {i+1} DIFF: {'; '.join(diffs)}")
