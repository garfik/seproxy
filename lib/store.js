const utils = require('./utils');

let store = {};
let requests = {};

function createRequest(ua) {
    let reqId = utils.getUuid();
    if (!store[ua]) {
        store[ua] = [];
    }
    store[ua].push(reqId);
    requests[reqId] = {
        request: {},
        response: {},
        proxyCode: 'ok',
        duration: 0
    };
    return reqId;
}

function appendBody(id, place, chunk) {
    if (!requests[id] || !chunk || chunk.length === 0) {
        return;
    }
    if (!requests[id][place]) {
        requests[id][place] = {};
    }
    if (!requests[id][place]['body']) {
        requests[id][place]['body'] = [];
    }
    requests[id][place]['body'].push(chunk);
}

function finishBody(id, place) {
    if (!requests[id] || !requests[id][place] || !requests[id][place]['body']) {
        return;
    }
    if (requests[id][place]['body'] instanceof Array) {
        requests[id][place]['body'] = Buffer.concat(requests[id][place]['body']).toString();
    }
}

function writeRequest(id, request) {
    if (!requests[id]) {
        return;
    }
    Object.assign(requests[id]['request'], request);
}

function writeResponse(id, response) {
    if (!requests[id]) {
        return;
    }
    Object.assign(requests[id]['response'], response);
}

function writeProxyCode(id, code) {
    if (!requests[id]) {
        return;
    }
    requests[id]['proxyCode'] = code;
}

function writeDuration(id, duration) {
    if (!requests[id]) {
        return;
    }
    requests[id]['duration'] = duration;
}

function getStoreId(ua) {
    if (!store[ua]) {
        return Object.keys(store).find(el => {
            return el.indexOf(ua) > -1;
        })
    }
    return ua;
}

function getLogs(ua) {
    let id = getStoreId(ua);
    let result = [];
    if (!id || !store[id] || store[id].length === 0) {
        return result;
    }
    let reqIds = store[id];
    reqIds.forEach(reqId => {
        result.push(requests[reqId]);
    })
    return result;
}

function clearLogs(ua) {
    let id = getStoreId(ua);
    if (!id || !store[id] || store[id].length === 0) {
        return;
    }
    let reqIds = store[id];
    reqIds.forEach(reqId => {
        delete requests[reqId];
    })
    delete store[id];
}

function clearAll() {
    requests = {};
    store = {};
}

module.exports = {
    appendBody,
    finishBody,
    createRequest,
    writeRequest,
    writeResponse,
    writeProxyCode,
    writeDuration,
    getLogs,
    clearLogs,
    clearAll
}