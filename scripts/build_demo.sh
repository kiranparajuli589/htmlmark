#!/usr/bin/env bash

rm -rf docs/
cd demo || exit
pnpm build
