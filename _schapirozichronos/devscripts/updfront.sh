#!/bin/bash
f="$1"
d="$2"
mdName="${f%% *}.md"
content=''
if [[ -f "$mdName" ]]; then
    content="$(./content.sh "$mdName")"
    echo "restoring $mdName content: $content" >&2
fi
front="$(./regenfront.sh "$f" "$d")"
cat << EOF
---
$front
---
$content
EOF

