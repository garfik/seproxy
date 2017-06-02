const finalhandler = require('finalhandler')
const Router = require('router');
const Store = require('./store');

const router = Router();
const json = JSON.stringify;

router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('SE-Proxy greetings you!');
});

router.get('/api/reload_routes', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    // TODO
    res.end('Ok');
});

router.get('/api/get_logs/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (!req.params.id) {
        res.end(json({error: 'Bad request'}), 400);
        return;
    }
    let store = Store.getLogs(req.params.id);
    if (!store || store.length === 0) {
        res.end(json({error: 'Not found'}), 404);
        return;
    }
    res.end(json(store));
});

router.get('/api/clear_logs/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (!req.params.id) {
        res.end(json({error: 'Bad request'}), 400);
        return;
    }
    Store.clearLogs(req.params.id);
    res.end('Ok');
});

router.get('/api/clear_all_logs', (res, req) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    Store.clearAll();
    res.end('Ok');
});

function route(req, res) {
    return router(req, res, finalhandler(req, res));
}

module.exports.route = route;