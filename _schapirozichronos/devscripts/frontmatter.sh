#!/bin/bash
f="$1"
sepcount=0
IFS=''
while read -r l; do
    [[ "$sepcount" -eq 1 ]] && [[ "$l" != '---' ]] && printf '%s\n' "$l"
    [[ "$l" == '---' ]] && sepcount=$(($sepcount + 1))
    [[ "$sepcount" -ge 2 ]] && break
done < "$f"

