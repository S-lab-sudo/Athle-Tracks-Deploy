const fs = require('fs');

const log = (message, level = 'info') => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}\n`;

    console.log(logMessage);

    // Optionally, log to a file
    fs.appendFile('app.log', logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};

module.exports = { log };