#!/bin/bash

git about

exec < /dev/tty

while true; do
    read -p "Is the pairs been set properly? (y/n) " IS_PAIRS_SET

    if [[ $IS_PAIRS_SET =~ ^[Nn]$ ]];then
      read -p "Enter your pair initials separated by space: " INITIALS
      git pair $INITIALS
    fi
    break
done