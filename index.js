const http = require('http');
const httpProxy = require('http-proxy');
const url = require('url');

const proxy = httpProxy.createProxyServer({
    secure: false,
    xfwd: false,
    changeOrigin: true
});

function getUA(headers) {
    for (var header in headers) {
        if (headers.hasOwnProperty(header) && header.toUpperCase() === 'USER-AGENT') {
            return headers[header];
        }
    }
    return '';
}

http.createServer(function (req, res) {
    //console.log(`Поступил запрос на ${req.url} от ${getUA(req.headers)}`);
    let targetHost = url.parse(req.url);
    proxy.web(req, res, {
        target: targetHost.protocol + '//' + targetHost.host,
        changeOrigin: true
    });
}).listen(8010);

console.log('Приложение запущено');

proxy.on('proxyRes', function (proxyRes, req, res) {
    /*
    if (req.url.indexOf('App_Themes/SU/themes_all_1.0.0525.1343.css') > -1) {
        console.log('proxy RES', proxyRes.statusCode);
        console.log(JSON.stringify(proxyRes.headers, null, 2));
    }*/
});

proxy.on('proxyReq', function (proxyReq, req, res) {
    /*
    if (req.url.indexOf('App_Themes/SU/themes_all_1.0.0525.1343.css') > -1) {
        console.log('proxy REQ', JSON.stringify(req.headers, null, 2));
        console.log(req.url);
    }
    */
});

//
// Listen for the `open` event on `proxy`.
//
proxy.on('open', function (proxySocket) {
    // listen for messages coming FROM the target here
    proxySocket.on('data', () => {
        console.log('Message from target');
    });
});

proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. And we are reporting a custom error message.');
});


//
// Listen for the `close` event on `proxy`.
//
proxy.on('close', function (res, socket, head) {
    // view disconnected websocket connections
    console.log('Client disconnected');
});