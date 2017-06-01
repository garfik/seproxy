const path = require('path');
const configModule = require('./lib/config');
const ProxyModule = require('./lib/proxy');
const loggerModule = require('./lib/logger');

const configDir = path.resolve(__dirname, 'configs');
let config = configModule.getConfig(configDir);
let routes = configModule.getRoutes(configDir);

const logger = loggerModule.initLogger(config.logLevel);
const proxy = new ProxyModule(config, routes);
proxy.init();