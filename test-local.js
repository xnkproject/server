// Script para testar o servidor localmente
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testServer() {
  console.log('🧪 Testando servidor local...\n');
  
  // 1. Health Check
  console.log('1️⃣ Testando Health Check...');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('⚠️ Certifique-se de que o servidor está rodando: npm start');
    return;
  }
  
  console.log('\n');
  
  // 2. Validar Licença
  console.log('2️⃣ Testando Validação de Licença...');
  try {
    const response = await fetch(`${BASE_URL}/api/validate-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: 'TEST-1234-5678-9012',
        hwid: 'test-hwid-123'
      })
    });
    const data = await response.json();
    console.log('✅ Validação:', data);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  console.log('\n');
  
  // 3. Obter Créditos
  console.log('3️⃣ Testando Obter Créditos...');
  try {
    const response = await fetch(`${BASE_URL}/api/get-credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: 'TEST-1234-5678-9012'
      })
    });
    const data = await response.json();
    console.log('✅ Créditos:', data);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  console.log('\n');
  console.log('🎉 Testes concluídos!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Se todos os testes passaram, faça o deploy: vercel --prod');
  console.log('2. Anote a URL do deploy');
  console.log('3. Atualize a extensão com a URL');
}

testServer();
