#!/bin/bash
# Cleanup CHANGELOG.md - keep only the latest N entries
# Usage: ./cleanup-changelog.sh [max_entries]

MAX_ENTRIES=${1:-30}
cd "$(git rev-parse --show-toplevel)" || exit 0

CHANGELOG="CHANGELOG.md"

if [ ! -f "$CHANGELOG" ]; then
    echo "CHANGELOG.md not found"
    exit 1
fi

# Extract header (first line)
HEADER=$(head -1 "$CHANGELOG")

# Extract entries (each entry starts with ## [timestamp])
# Count current entries
ENTRY_COUNT=$(grep -c "^## \[" "$CHANGELOG" || echo "0")

echo "Current entries: $ENTRY_COUNT"
echo "Max entries: $MAX_ENTRIES"

if [ "$ENTRY_COUNT" -le "$MAX_ENTRIES" ]; then
    echo "No cleanup needed"
    exit 0
fi

# Create temp file with header and latest entries
TEMP_FILE=$(mktemp)
echo "$HEADER" > "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Get the latest N entries (entries are separated by ---)
# Each entry block: ## [date] ... ---
awk -v max="$MAX_ENTRIES" '
BEGIN { count = 0; in_entry = 0 }
/^## \[/ {
    count++
    if (count > (total - max)) {
        in_entry = 1
        if (count > (total - max + 1)) print "---"
    } else {
        in_entry = 0
    }
}
in_entry { print }
' total="$ENTRY_COUNT" "$CHANGELOG" >> "$TEMP_FILE"

# Replace original file
mv "$TEMP_FILE" "$CHANGELOG"

NEW_COUNT=$(grep -c "^## \[" "$CHANGELOG" || echo "0")
echo "Cleaned up: kept $NEW_COUNT entries"
