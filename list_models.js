const https = require('https');

const API_KEY = 'AIzaSyDsl5dvLeH3WtsfQ93RnZ01UePo_pAQsBE';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const parsedData = JSON.parse(data);
            if (parsedData.error) {
                console.error('API Error:', parsedData.error);
            } else {
                console.log('Available Models:');
                if (parsedData.models) {
                    parsedData.models.forEach(model => {
                        console.log(`- ${model.name} (${model.version}) - ${model.displayName}`);
                    });
                } else {
                    console.log('No models found in response:', parsedData);
                }
            }
        } catch (e) {
            console.error('Parse Error:', e.message);
            console.log('Raw Data:', data);
        }
    });

}).on('error', (err) => {
    console.error('Network Error:', err.message);
});
