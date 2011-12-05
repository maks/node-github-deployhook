/*jshint node:true, globalstrict:true,  sub:true */

"use strict";

/**
 * roughly based on code from: https://github.com/brianc/node-auto-deploy/blob/master/serve.js
 */

var log = require('nlogger').logger(module),
    http = require('http'),
    exec = require('child_process').exec,
    command = 'git pull origin master && npm install',
    deployPath = 'cd /var/www/mydvds/app',
    options = {
        cwd: deployPath
    };

http.createServer(function(req,res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    deploy();
    res.end('deployed\n');
}).listen(process.env.PORT);

console.log('Server running on port:'+process.env.PORT);

//execute a git pull within the deployPath
//and then execute an npm install
function deploy() {
    exec(command, options, function(error, stdout, stderr) {
        if (error) {
            return log.error(command, {
                error: error,
                stdout: stdout,
                stderr: stderr
            });
        }

        log.debug(command, {
            stdout: stdout,
            stderr: stderr
        });

        //restart upstart process with the same name
        var cmd = 'sudo restart mydvds';
        log.info('restarting upstart process', cmd);

        exec(cmd, function(err, stdout, stderr) {
            log.debug('restarted', {
                error: err,
                stdout: stdout,
                stderr: stderr
            });
        });

    });
}
