#!/usr/bin/env python3
"""Generate INSERT statements with ON CONFLICT DO NOTHING for remaining records."""
import re
import os

batches_dir = r"c:\project\beauty-site\batches\combined"
existing_max = 250  # We have records up to id 250

all_records = []
for i in range(1, 26):
    filepath = os.path.join(batches_dir, f"batch_{i:02d}.sql")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "VALUES" in content:
        values_part = content.split("VALUES", 1)[1].strip()
        values_part = values_part.rstrip(';')
        
        # Find all tuples
        tuples = re.findall(r'\([\s\S]*?\)(?:\s*,|\s*;|\s*$)', values_part)
        for t in tuples:
            t_clean = t.strip().rstrip(',').rstrip(';')
            id_match = re.match(r'\((\d+),', t_clean)
            if id_match:
                rec_id = int(id_match.group(1))
                if rec_id > existing_max:
                    all_records.append(t_clean)

print(f"Records to insert (id > {existing_max}): {len(all_records)}")
if all_records:
    print(f"First id: {re.match(r'\((\d+)', all_records[0]).group(1)}")
    print(f"Last id: {re.match(r'\((\d+)', all_records[-1]).group(1)}")

# Generate SQL - chunk by celebrity ranges
header = """INSERT INTO photo_collections (id, celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status, created_at, updated_at) VALUES"""

# Save all remaining to a single file
if all_records:
    sql = header + " " + ", ".join(all_records) + " ON CONFLICT (id) DO NOTHING;"
    with open(r"c:\project\beauty-site\batches\remaining_insert.sql", 'w', encoding='utf-8-sig') as f:
        f.write(sql)
    print(f"\nTotal SQL length: {len(sql)} chars")
    print("Saved to: remaining_insert.sql")
