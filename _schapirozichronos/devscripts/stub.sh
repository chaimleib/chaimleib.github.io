#!/bin/bash
f="$1"

# from filename
ext=".${f##*.}"
order="${f%% *}"
fbase="${f%$ext}"
frest="${fbase#$order - }"
title="${frest#* 5[0-9][0-9][0-9] }"
hdate="${frest% $title}"

# other tools
ffprobe="$(ffprobe -v quiet -show_streams -print_format json "$f")"
date="$(echo "$ffprobe" | jq '.streams[0].tags.creation_time' -r)"
datefmt='%Y-%m-%dT%H:%M:%SZ'
if [ "$date" == null ]; then
    creation="$(gstat --printf="%w" "$f")"
    echo "$f: $creation" >&2
    date="$(gdate -u +"$datefmt" -d "$creation")"
else
    date="$(date -u +"$datefmt")"
fi
mime="$(file --mime-type "$f")"
mime="${mime##*: }"
size="$(gstat --printf="%s" "$f")"
duration_total="$(echo "$ffprobe" | jq '.streams[0].duration' -r)"
duration_frac="${duration_total##*.}"
duration_total_int="${duration_total%.$duration_frac}"
duration_m=$(( $duration_total_int / 60 ))
duration_s=$(( $duration_total_int - $duration_m * 60 ))
cat << EOF
---
name: "$fbase"
order: "$order"
date: "$date"
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
