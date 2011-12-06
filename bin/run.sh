#! //bin/sh
export PORT=1974
export DEPLOY_PATH=/var/www
export RESTART_CMD="sudo restart mydvds"

cd /var/www/node-github-deployhook
node lib/server.js 2>>  /var/log/nodejs/node-github-deployhook-error.log 1>> /var/log/nodejs/node-github-deployhook.log
