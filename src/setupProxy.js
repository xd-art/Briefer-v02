const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    console.log('✅ SetupProxy is being registered for Gemini API...');

    const API_KEY = 'AIzaSyBlx4gjERN7s2mBzWAJO_5GxhOK73ynpI4';

    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://generativelanguage.googleapis.com',
            changeOrigin: true,
            pathRewrite: {
                '^/api': `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`
            },
            onProxyReq: (proxyReq, req, res) => {
                console.log('🔄 Proxying to:', proxyReq.path);
            },
            onProxyRes: (proxyRes) => {
                console.log('✅ Status:', proxyRes.statusCode);
            },
            onError: (err, req, res) => {
                console.error('❌ Proxy Error:', err);
                res.status(500).json({ error: 'Proxy Error', details: err.message });
            }
        })
    );
};
