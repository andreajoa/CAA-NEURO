const https = require('https');
const accountId = 'YOUR_ACCOUNT_ID';
const dbId = 'YOUR_DB_ID';
const token = 'YOUR_TOKEN';

// Se você não tiver essas variáveis, me passe e eu substituo
console.log('Preciso das credenciais do Cloudflare D1 para verificar admin_defaults');
console.log('Ou acesse o painel Cloudflare D1 e rode:');
console.log('SELECT cards FROM admin_defaults WHERE key="infantil_emergente" LIMIT 1;');
