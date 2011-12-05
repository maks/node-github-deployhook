#! //bin/sh
export PORT=1974
export DEPLY_PATH=/var/www/mydvds/app
export RESTART_CMD="sudo restart mydvds"

node lib/server.js
