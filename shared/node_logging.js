const { execFile } = require('child_process');
const path = require('path');

function log(level, module, message) {
    const scriptPath = path.join(__dirname, '..', 'scripts', 'log.sh');
    execFile(scriptPath, [level, module, message], (error) => {
        if (error) {
            console.error(`Error logging message: ${error}`);
        }
    });
}

function info(module, message) {
    log('INFO', module, message);
}

function warn(module, message) {
    log('WARN', module, message);
}

function error(module, message) {
    log('ERROR', module, message);
}

module.exports = {
    info,
    warn,
    error
};

// Usage example:
// const logger = require('./shared/node_logging');
// 
// logger.info('my_module', 'This is an info message');
// logger.warn('my_module', 'This is a warning message');
// logger.error('my_module', 'This is an error message');