const crypto = require("crypto");

function getIpAddress(req) {
    return getHeader(req.headers, 'x-forwarded-for') || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
}

function getUuid() {
    return crypto.randomBytes(32).toString("hex");
}

function getHeader(headers, name) {
    let upperCasedName = name.toUpperCase();
    for (var header in headers) {
        if (headers.hasOwnProperty(header) && header.toUpperCase() === upperCasedName) {
            return headers[header];
        }
    }
    return null;
}

module.exports = {
    getHeader,
    getUuid,
    getIpAddress
};