#!/bin/sh
bun run reset
bun run build
# docker volume is the only way to synchronize fs between host and client
# consolidate these into a single volume
docker volume create sockets
#docker volume create data
#docker volume create git
bun run run:host
