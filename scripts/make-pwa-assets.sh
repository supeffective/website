#!/bin/bash

set -e # exit when any command fails

DEST_DIR='public/images/pwa'
BG_COLOR='#174D8B'

pwa-asset-generator public/images/logo/icon.svg $DEST_DIR \
    --icon-only --favicon --padding '8%' --background $BG_COLOR

pwa-asset-generator public/images/logo/logo.svg $DEST_DIR \
    --splash-only --padding '15%' --background $BG_COLOR
