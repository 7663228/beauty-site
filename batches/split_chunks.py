#!/usr/bin/env python3
"""Split remaining inserts into smaller chunks."""
import re
import os

filepath = r"c:\project\beauty-site\batches\remaining_insert.sql"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract VALUES clause
vals_match = re.search(r'VALUES (.+) ON CONFLICT', content, re.DOTALL)
if not vals_match:
    print("No VALUES found")
    exit(1)

values_str = vals_match.group(1).strip()

# Split by tuples - find all complete tuples
tuples = re.findall(r'\([\s\S]*?\)(?=\s*,|\s*$)', values_str)
tuples = [t.strip().rstrip(',') for t in tuples if t.strip()]

print(f"Total tuples: {len(tuples)}")

# Split into chunks of 40
chunk_size = 40
header = """INSERT INTO photo_collections (id, celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status, created_at, updated_at) VALUES"""

for i in range(0, len(tuples), chunk_size):
    chunk = tuples[i:i+chunk_size]
    if not chunk:
        continue
    
    sql = header + " " + ", ".join(chunk) + " ON CONFLICT (id) DO NOTHING;"
    
    chunk_file = f"c:\\project\\beauty-site\\batches\\insert_part_{i//chunk_size:02d}.sql"
    with open(chunk_file, 'w', encoding='utf-8-sig') as f:
        f.write(sql)
    
    first_id = re.match(r'\((\d+)', chunk[0]).group(1)
    last_id = re.match(r'\((\d+)', chunk[-1]).group(1)
    print(f"Chunk {i//chunk_size:02d}: {len(chunk)} records, ids {first_id}-{last_id}, {len(sql)} chars")
