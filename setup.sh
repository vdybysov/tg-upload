#!/bin/bash

rm -rf /usr/local/tgft
git clone https://github.com/vdybysov/tgft.git /usr/local/tgft
npm install --prefix /usr/local/tgft
npm run setup --prefix /usr/local/tgft
