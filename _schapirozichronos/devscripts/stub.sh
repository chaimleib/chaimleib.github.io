#!/bin/bash
f="$1"

# from filename
ext=".${f##*.}"
order="${f%% *}"
fbase="${f%$ext}"
frest="${fbase#$order - }"
title="${frest##* 5[0-9][0-9][0-9] }"
hdate="${frest% $title}"

# other tools
mime="$(file --mime-type "$f")"
mime="${mime##*: }"
size="$(wc -c "$f" | cut -d' ' -f2)"
duration_total="$(ffprobe -v quiet -show_streams -print_format json "$f" | jq '.streams[0].duration' -r)"
duration_frac="${duration_total##*.}"
duration_total_int="${duration_total%.$duration_frac}"
duration_m=$(( $duration_total_int / 60 ))
duration_s=$(( $duration_total_int - $duration_m * 60 ))
cat << EOF
---
name: "$fbase"
order: "$order"
hdate: "$hdate"
title: "$title"
keywords: []
file:
- ext: "$ext"
  mime: "$mime"
  size: $size
  duration: "$duration_m:$duration_s"
published: true
---

EOF
