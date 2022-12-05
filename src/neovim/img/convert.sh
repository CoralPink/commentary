#!/bin/sh
Files=$(find . -type f -iname '*'.jpg -o -iname '*'.png)

for File in $Files
do
    echo $File
    cwebp -preset photo -metadata icc -sharp_yuv -o $File".webp" -progress -short $File
    printf "\n----------------\n\n"
done
