/*jshint node:true, globalstrict:true,  sub:true */

"use strict";

/**
 * roughly based on code from: https://github.com/brianc/node-auto-deploy/blob/master/serve.js
 */

var log = require('nlogger').logger(module),
    http = require('http'),
    path = require('path'),
    decodeForm = require('./www-forms').decodeForm,
    exec = require('child_process').exec,
    command = 'git pull origin master && npm update',
    currentResponse,
    reqBody = [],
    options = {}; 

/**
 * @param {bool} processedOk
 */
function sendResponse(processedOk, messageText) {
    var responseCode = (processedOk === true) ? 200 : 500;

    currentResponse.writeHead(responseCode,
        {
            "Content-Type": "text/plain"
        }
    );
    currentResponse.write(messageText ? messageText : "");
    currentResponse.end();
}

//execute a git pull within the deployPath
//and then execute an npm install
function deploy(projectName) {

    options.cwd = path.join(process.env.DEPLOY_PATH, projectName);
    log.info('doing pull and npm, cwd:'+options.cwd);
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
        log.info('restarting upstart process', process.env.RESTART_CMD);

        exec(process.env.RESTART_CMD, function(err, stdout, stderr) {
            log.debug('restarted', {
                error: err,
                stdout: stdout,
                stderr: stderr
            });
        });

        sendResponse(true, 'deployed');
    });
}

function requestHandler(request, response) {
    currentResponse = response;

    if (request.url.charAt(0) === "/" && request.method === "POST") {
        log.info("got POST for /");
        
        request.setEncoding('utf8');

        request.on("data", function(chunk) {
            reqBody.push(chunk);
        });

    } else {
        sendResponse("GET Request not supported");
    }

    request.on("end", function() {
        var reqBodyText = reqBody.join(''),
            data;
   
        data = decodeForm(reqBodyText);
        data = JSON.parse(data.payload || '{}');
    
        log.info('repo:'+data.repository.name);
        log.info('ref:'+data.ref);
        if (data && data.ref && (data.ref === 'refs/heads/master')) {
            deploy(data.repository.name);
        }
        reqBody = [];
    });
}

http.createServer(requestHandler).listen(process.env.PORT, function() {
    log.warn("node-github-deployhook listening on port:"+process.env.PORT);
});


