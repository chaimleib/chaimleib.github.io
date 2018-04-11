#!/bin/bash
f="$1"
sepcount=0
IFS=''
while read -r l; do
    [[ "$sepcount" -ge 2 ]] && echo "$l"
    [[ "$l" == '---' ]] && sepcount=$(($sepcount + 1))
done < "$f"

