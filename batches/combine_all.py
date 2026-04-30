#!/usr/bin/env python3
"""Combine all 25 batch files into one mega INSERT statement."""
import os

batches_dir = r"c:\project\beauty-site\batches\combined"
output_file = r"c:\project\beauty-site\batches\mega_insert.sql"

all_values = []

for i in range(1, 26):
    filepath = os.path.join(batches_dir, f"batch_{i:02d}.sql")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract VALUES clause
    if "VALUES" in content:
        values_part = content.split("VALUES", 1)[1].strip()
        # Remove trailing semicolon if present
        values_part = values_part.rstrip(';')
        all_values.append(values_part)
        print(f"Batch {i}: extracted VALUES")

# Combine all
header = """INSERT INTO photo_collections (id, celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status, created_at, updated_at) VALUES"""
combined = header + " " + ", ".join(all_values) + ";"

with open(output_file, 'w', encoding='utf-8-sig') as f:
    f.write(combined)

print(f"\nTotal length: {len(combined)} characters")
print(f"Saved to: {output_file}")

# Count VALUES tuples
import re
count = len(re.findall(r'\(\d+,', combined))
print(f"Total INSERT tuples: {count}")
