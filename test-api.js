// Test API endpoint
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/api/articles/categories/content_creation',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('✅ API Response:');
            console.log('Category:', json.category?.label || 'N/A');
            console.log('Articles count:', json.articles?.length || 0);
            if (json.articles && json.articles.length > 0) {
                console.log('\nArticles:');
                json.articles.forEach((a, i) => {
                    console.log(`${i + 1}. ${a.title}`);
                    console.log(`   ID: ${a.id}, Status: ${a.status}, Published: ${a.is_published_in_categories}`);
                });
            } else {
                console.log('\n⚠️  No articles found');
                console.log('Full response:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error('❌ Error parsing JSON:', e);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('❌ API request failed:', e.message);
    console.log('Make sure the server is running on port 3003');
});

req.end();
