#!/bin/bash
f="$1"
front="$(./regenfront.sh "$f")"
content="$([[ -f "${f%% *}.md" ]] && ./content.sh "${f%% *}.md")"
cat << EOF
---
$front
---
$content
EOF

