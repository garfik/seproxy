const urlModule = require('url');
const loggerModule = require('./logger');
let logger;

module.exports = class RoutesModule {

    constructor(routes) {
        logger = loggerModule.getLogger();
        this.routes = this.handleRegExp(routes);
    }

    handleRegExp(routes) {
        return routes.map(r => {
            r.pattern = new RegExp(r.pattern);
            return r;
        })
    }

    getRoute(fullUrl) {
        for (let i = 0, len = this.routes.length; i < len; i += 1) {
            let r = this.routes[i];
            let url = !!r.searchOnlyInHost ? urlModule.parse(fullUrl).host: fullUrl;
            
            if (r.pattern.test(url)) {
                return r;
            }
        }
        return null;
    }
}