const path = require('path');
const fs = require('fs');

let config = null;

function getConfig(configDir, forceReload) {
    if (config && !forceReload) {
        return config;
    }
    // Read default config
    let defaultCfg = JSON.parse(fs.readFileSync(path.resolve(configDir, 'config.default.json'), 'utf8'));
    // Read local config
    let localCfg = {};
    let localCfgPath = path.resolve(configDir, 'config.local.json');
    if (fs.existsSync(localCfgPath)) {
        localCfg = JSON.parse(fs.readFileSync(localCfgPath, 'utf8'));
    }

    config = Object.assign({}, defaultCfg, localCfg);
    return config;
}

function getRoutes(configDir) {
    // Read default config
    let routes = JSON.parse(fs.readFileSync(path.resolve(configDir, 'routes.json'), 'utf8'));

    return routes;
}

module.exports = {
    getConfig,
    getRoutes
}