#!/bin/bash

for filename in /run/secrets/*; do
if [[ ${filename} != "/run/secrets/esign-enc" ]]; then
  . $filename
fi
done