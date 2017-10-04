const mitmproxy = require('http-mitm-proxy');
const url = require('url');
const fs = require('fs');
const loggerModule = require('./logger');
const utils = require('./utils');
const api = require('./api');
const RoutesModule = require('./routes');
const Store = require('./store');
let logger;

module.exports = class Proxy {

    constructor(cfg, routes) {
        this.config = cfg;
        this.routes = new RoutesModule(routes);
        logger = loggerModule.getLogger();
    }

    init() {
        this.proxy = mitmproxy();
        this.proxy.use(mitmproxy.gunzip);
        this.proxy.onError(this.onError.bind(this));
        this.proxy.onRequest(this.onRequest.bind(this));

        this.proxy.listen({ port: this.config.proxyPort });
        logger.info('Http proxy server is listening on *:' + this.config.proxyPort);
    }

    onRequest(ctx, callback) {
        let fullUrl = (ctx.isSSL ? 'https' : 'http') + '://' + ctx.clientToProxyRequest.headers.host + ctx.clientToProxyRequest.url;
        const requestStart = new Date();
        if (this.config.proxyUrls.includes(ctx.clientToProxyRequest.headers.host)) {
            api.route(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
            return;
        }
        let ua = utils.getHeader(ctx.clientToProxyRequest.headers, 'user-agent');
        let reqId = Store.createRequest(ua);
        Store.writeRequest(reqId, {
            method: ctx.clientToProxyRequest.method,
            ip: utils.getIpAddress(ctx.clientToProxyRequest),
            url: fullUrl,
            headers: ctx.clientToProxyRequest.headers,
            body: []
        });
        logger.verbose(`Got a request #${reqId} to ${fullUrl} from [${utils.getIpAddress(ctx.clientToProxyRequest)}] ${ua}`);
        let routeCfg = this.routes.getRoute(fullUrl);

        if (!routeCfg) {
            logger.warn(`Can't find URL ${fullUrl} in routing table`);
            ctx.proxyToClientResponse.writeHead(404);
            ctx.proxyToClientResponse.end('Url not found');
            Store.writeResponse(reqId, {
                httpCode: 404
            });
            Store.writeProxyCode(reqId, 'url_not_found_in_proxy');
            return;
        }
        if (routeCfg.blockRequest) {
            ctx.proxyToClientResponse.writeHead(routeCfg.blockRequestCode);
            ctx.proxyToClientResponse.end('Url blocked');
            Store.writeResponse(reqId, {
                httpCode: routeCfg.blockRequestCode
            });
            Store.writeProxyCode(reqId, 'url_blocked_by_proxy');
            return;
        }
        ctx.proxyToClientResponse.setTimeout(routeCfg.timeoutMs || this.config.defaultTimeout, () => {
            logger.verbose(`Timeout on ${fullUrl}`);
            if (!ctx.proxyToClientResponse.finished) {
                Store.writeResponse(reqId, {
                    httpCode: 0
                });
                Store.writeProxyCode(reqId, 'timeout');
                ctx.proxyToClientResponse.end();
            }
        });

        ctx.onResponseData((ctx, chunk, callback) => {
            //logger.verbose('Giving data for id=' + reqId + '; ' + ua + ';')
            let contentType = utils.getHeader(ctx.serverToProxyResponse.headers, 'content-type');
            if (contentType && contentType.indexOf('application/json') > -1) {
                Store.appendBody(reqId, 'response', chunk);
            }            
            return callback(null, chunk);
        });
        ctx.onRequestData((ctx, chunk, callback) => {
            //logger.verbose('Getting data from id=' + reqId + '; ' + ua + ';')
            let contentType = utils.getHeader(ctx.clientToProxyRequest.headers, 'content-type');
            if (ctx.clientToProxyRequest.method !== 'GET' && contentType && contentType.indexOf('application/json') > -1) {
                Store.appendBody(reqId, 'request', chunk);
            }            
            return callback(null, chunk);
        });
        ctx.onResponseEnd((ctx, callback) => {
            //logger.verbose('Gave data for id=' + reqId + '; ' + ua + ';')
            const requestEnd = new Date();
            Store.writeDuration(reqId, requestEnd - requestStart)
            Store.finishBody(reqId, 'response');
            Store.writeResponse(reqId, {
                httpCode: ctx.serverToProxyResponse.statusCode,
                headers: ctx.serverToProxyResponse.headers
            });
            return callback();
        });
        ctx.onRequestEnd((ctx, callback) => {
            //logger.verbose('Got data from id=' + reqId + '; ' + ua + ';')
            Store.finishBody(reqId, 'request');
            return callback();
        });

        return callback();
    }

    onError(ctx, err, errorKind) {
        // ctx may be null
        if (err && err.message === 'write after end') {
            // timeout reached
            return;
        }
        var url = (ctx && ctx.clientToProxyRequest) ? ctx.clientToProxyRequest.url : '';
        logger.error(errorKind + ' on ' + url + ':', err);
    }
}