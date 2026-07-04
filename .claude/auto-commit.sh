#!/bin/bash
# Auto-commit script for Claude Code modifications
# Records changes to CHANGELOG.md and commits
# Keeps only the latest 30 entries to prevent file bloat

MAX_ENTRIES=30
cd "$(git rev-parse --show-toplevel)" || exit 0

# Stage all changes first
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    exit 0
fi

# Get timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Get list of changed files (limit to 5 for readability)
CHANGED_FILES=$(git diff --cached --name-only | head -5)
FILE_COUNT=$(git diff --cached --name-only | wc -l)

# Get brief diff stats
DIFF_STATS=$(git diff --cached --stat | tail -1)

# Build the changelog entry
ENTRY="## [$TIMESTAMP]\n\n"
ENTRY+="**修改文件:** \n"

while IFS= read -r file; do
    if [ -n "$file" ] && [ "$file" != "CHANGELOG.md" ]; then
        ENTRY+="- \`$file\`\n"
    fi
done <<< "$CHANGED_FILES"

if [ "$FILE_COUNT" -gt 5 ]; then
    ENTRY+="- ...及其他 $((FILE_COUNT - 5)) 个文件\n"
fi

ENTRY+="\n**变更统计:** $DIFF_STATS\n"
ENTRY+="\n---\n"

# Append to CHANGELOG.md (after the header)
sed -i '/^---$/a\'"$ENTRY" CHANGELOG.md

# Auto-cleanup: keep only latest MAX_ENTRIES
ENTRY_COUNT=$(grep -c "^## \[" CHANGELOG.md || echo "0")
if [ "$ENTRY_COUNT" -gt "$MAX_ENTRIES" ]; then
    HEADER=$(head -1 CHANGELOG.md)
    TEMP_FILE=$(mktemp)
    echo "$HEADER" > "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"

    awk -v max="$MAX_ENTRIES" -v total="$ENTRY_COUNT" '
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
    ' CHANGELOG.md >> "$TEMP_FILE"

    mv "$TEMP_FILE" CHANGELOG.md
fi

# Re-stage CHANGELOG.md and commit
git add CHANGELOG.md
git commit -m "auto: update $(echo "$CHANGED_FILES" | head -1)"
