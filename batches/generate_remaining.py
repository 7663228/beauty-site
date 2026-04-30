#!/usr/bin/env python3
"""Generate remaining photo_collections inserts from batch files."""
import json
import os

batches_dir = r"c:\project\beauty-site\batches\combined"

# First, determine what we have (1-80 inserted)
existing_ids = set(range(1, 81))

all_values = []
for i in range(1, 26):
    filepath = os.path.join(batches_dir, f"batch_{i:02d}.sql")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract VALUES clause
    if "VALUES" in content:
        values_part = content.split("VALUES", 1)[1].strip()
        values_part = values_part.rstrip(';')
        # Split by tuples
        import re
        tuples = re.findall(r'\([\s\S]*?\),?\s*$', values_part, re.MULTILINE)
        
        for t in tuples:
            # Extract id
            t_clean = t.strip().rstrip(',').rstrip(';')
            # Get first number as id
            id_match = re.match(r'\((\d+),', t_clean)
            if id_match:
                rec_id = int(id_match.group(1))
                if rec_id not in existing_ids:
                    all_values.append(t_clean)

print(f"Remaining records to insert: {len(all_values)}")
print(f"First 3 ids: {[re.match(r'\((\d+)', v).group(1) for v in all_values[:3]]}")
print(f"Last 3 ids: {[re.match(r'\((\d+)', v).group(1) for v in all_values[-3:]]}")

# Generate SQL
header = """INSERT INTO photo_collections (id, celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status, created_at, updated_at) VALUES"""

# Split into chunks of ~50
chunk_size = 50
for chunk_num, i in enumerate(range(0, len(all_values), chunk_size)):
    chunk = all_values[i:i+chunk_size]
    if not chunk:
        continue
    sql = header + " " + ", ".join(chunk) + ";"
    print(f"\n--- CHUNK {chunk_num} ({len(chunk)} records, ids {re.match(r'\((\d+)', chunk[0]).group(1)} to {re.match(r'\((\d+)', chunk[-1]).group(1)}) ---")
    print(f"Length: {len(sql)} chars")
    # Save chunk
    chunk_file = f"c:\\project\\beauty-site\\batches\\insert_chunk_{chunk_num:02d}.sql"
    with open(chunk_file, 'w', encoding='utf-8-sig') as f:
        f.write(sql)
    print(f"Saved to: {chunk_file}")
