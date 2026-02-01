const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar Supabase com suas credenciais
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iaefzzoqnnxmnngdeqqu.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

// Configurar Firebase Admin
let firebaseInitialized = false;
try {
  if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "gpt-engineer-390607",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin inicializado');
  }
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error.message);
}

const db = firebaseInitialized ? admin.firestore() : null;

// ==================== ENDPOINTS ====================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Lovable Proxy Server',
    timestamp: new Date().toISOString(),
    firebase: firebaseInitialized ? 'connected' : 'not configured',
    supabase: 'connected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    firebase: firebaseInitialized,
    supabase: true
  });
});

// 1. Validar licença
app.post('/api/validate-license', async (req, res) => {
  try {
    const { licenseKey, hwid } = req.body;
    
    console.log('📝 Validando licença:', licenseKey);
    
    if (!licenseKey) {
      return res.json({
        success: false,
        error: 'Chave de licença não fornecida'
      });
    }
    
    // Buscar licença no Supabase
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single();
    
    if (error) {
      console.error('❌ Erro ao buscar licença:', error);
      return res.json({
        success: false,
        error: 'Licença não encontrada'
      });
    }
    
    if (!license) {
      return res.json({
        success: false,
        error: 'Licença inválida'
      });
    }
    
    // Verificar se está ativa
    if (!license.is_active) {
      return res.json({
        success: false,
        error: 'Licença desativada'
      });
    }
    
    // Verificar HWID (primeira vez ou match)
    if (license.hwid && license.hwid !== hwid) {
      return res.json({
        success: false,
        error: 'HWID não corresponde. Esta licença já está ativada em outro dispositivo.'
      });
    }
    
    // Atualizar HWID se for primeira vez
    if (!license.hwid && hwid) {
      const { error: updateError } = await supabase
        .from('licenses')
        .update({ 
          hwid: hwid,
          updated_at: new Date().toISOString()
        })
        .eq('license_key', licenseKey);
      
      if (updateError) {
        console.error('❌ Erro ao atualizar HWID:', updateError);
      } else {
        console.log('✅ HWID atualizado para licença:', licenseKey);
      }
    }
    
    console.log('✅ Licença validada:', licenseKey, '- Créditos:', license.credits);
    
    res.json({
      success: true,
      credits: license.credits,
      isActive: license.is_active
    });
    
  } catch (error) {
    console.error('❌ Erro ao validar licença:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 2. Enviar mensagem
app.post('/api/send-message', async (req, res) => {
  try {
    const { licenseKey, token, projectId, message, files } = req.body;
    
    console.log('📤 Enviando mensagem para projeto:', projectId);
    
    if (!licenseKey || !projectId || !message) {
      return res.json({
        success: false,
        error: 'Dados incompletos'
      });
    }
    
    // 1. Validar licença
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single();
    
    if (licenseError || !license) {
      console.error('❌ Licença não encontrada:', licenseKey);
      return res.json({
        success: false,
        error: 'Licença inválida'
      });
    }
    
    if (!license.is_active) {
      return res.json({
        success: false,
        error: 'Licença inativa'
      });
    }
    
    // 2. Verificar créditos
    if (license.credits <= 0) {
      return res.json({
        success: false,
        error: 'Sem créditos disponíveis'
      });
    }
    
    // 3. Verificar se Firebase está configurado
    if (!firebaseInitialized || !db) {
      return res.json({
        success: false,
        error: 'Firebase não configurado. Configure as variáveis de ambiente FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY'
      });
    }
    
    // 4. Enviar mensagem para Firestore
    const messageData = {
      content: message,
      role: 'user',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (files && files.length > 0) {
      messageData.files = files;
    }
    
    const result = await db
      .collection('projects')
      .doc(projectId)
      .collection('messages')
      .add(messageData);
    
    console.log('✅ Mensagem enviada:', result.id);
    
    // 5. Descontar crédito
    const { error: updateError } = await supabase
      .from('licenses')
      .update({ 
        credits: license.credits - 1,
        updated_at: new Date().toISOString()
      })
      .eq('license_key', licenseKey);
    
    if (updateError) {
      console.error('❌ Erro ao descontar crédito:', updateError);
    }
    
    // 6. Registrar uso
    const { error: logError } = await supabase
      .from('usage_logs')
      .insert({
        license_key: licenseKey,
        project_id: projectId,
        message_length: message.length
      });
    
    if (logError) {
      console.error('❌ Erro ao registrar log:', logError);
    }
    
    res.json({
      success: true,
      messageId: result.id,
      creditsRemaining: license.credits - 1
    });
    
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. Obter créditos
app.post('/api/get-credits', async (req, res) => {
  try {
    const { licenseKey } = req.body;
    
    if (!licenseKey) {
      return res.json({
        success: false,
        error: 'Chave de licença não fornecida'
      });
    }
    
    const { data: license, error } = await supabase
      .from('licenses')
      .select('credits, is_active')
      .eq('license_key', licenseKey)
      .single();
    
    if (error || !license) {
      return res.json({
        success: false,
        error: 'Licença não encontrada'
      });
    }
    
    res.json({
      success: true,
      credits: license.credits,
      isActive: license.is_active
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter créditos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 4. Adicionar créditos (admin)
app.post('/api/add-credits', async (req, res) => {
  try {
    const { licenseKey, credits } = req.body;
    
    if (!licenseKey || !credits) {
      return res.json({
        success: false,
        error: 'Dados incompletos'
      });
    }
    
    // Buscar licença atual
    const { data: license, error: fetchError } = await supabase
      .from('licenses')
      .select('credits')
      .eq('license_key', licenseKey)
      .single();
    
    if (fetchError || !license) {
      return res.json({
        success: false,
        error: 'Licença não encontrada'
      });
    }
    
    // Adicionar créditos
    const { error: updateError } = await supabase
      .from('licenses')
      .update({ 
        credits: license.credits + credits,
        updated_at: new Date().toISOString()
      })
      .eq('license_key', licenseKey);
    
    if (updateError) {
      return res.json({
        success: false,
        error: updateError.message
      });
    }
    
    res.json({
      success: true,
      newCredits: license.credits + credits
    });
    
  } catch (error) {
    console.error('❌ Erro ao adicionar créditos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Exportar para Vercel
module.exports = app;
