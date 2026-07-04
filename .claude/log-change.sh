#!/bin/bash
# Log completed changes to CHANGELOG.md
# Usage: ./log-change.sh "描述信息"
# Call this after completing modifications to a file/feature

MAX_ENTRIES=30
cd "$(git rev-parse --show-toplevel)" || exit 0

# Get current staged and unstaged changes
CHANGED_FILES=$(git diff --name-only HEAD | grep -v "^CHANGELOG.md$" | sort -u)
FILE_COUNT=$(echo "$CHANGED_FILES" | grep -c "." || echo "0")

if [ "$FILE_COUNT" -eq 0 ]; then
    echo "No changes to log"
    exit 0
fi

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
DIFF_STATS=$(git diff --stat HEAD -- $CHANGED_FILES | tail -1)

# Build entry
ENTRY="## [$TIMESTAMP]\n\n"
ENTRY+="**修改文件:** \n"

while IFS= read -r file; do
    if [ -n "$file" ]; then
        ENTRY+="- \`$file\`\n"
    fi
done <<< "$CHANGED_FILES"

ENTRY+="\n**变更统计:** $DIFF_STATS\n"

# Add custom description if provided
if [ -n "$1" ]; then
    ENTRY+="\n**说明:** $1\n"
fi

ENTRY+="\n---\n"

# Append to CHANGELOG.md
sed -i '/^# 项目修改记录/a\'"$ENTRY" CHANGELOG.md

# Cleanup old entries
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

echo "Logged changes to CHANGELOG.md"
git add CHANGELOG.md
