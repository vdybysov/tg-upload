#!/bin/bash

rm -rf /usr/local/tgft
git clone https://github.com/vdybysov/tgft.git /usr/local/tgft
(cd /usr/local/tgft && npm install)
(cd /usr/local/tgft && node /usr/local/tgft/setup.js)
