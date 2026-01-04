const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    console.log('✅ SetupProxy is being registered for Gemini API...');

    // Proxy API requests to the local backend
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:3002',
            changeOrigin: true,
            onProxyReq: (proxyReq, req, res) => {
                // console.log('🔄 Proxying to:', proxyReq.path);
            },
            onError: (err, req, res) => {
                console.error('❌ Proxy Error:', err);
                res.status(500).json({ error: 'Proxy Error', details: err.message });
            }
        })
    );
};
