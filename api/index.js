const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar Supabase com suas credenciais
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://iaefzzoqnnxmnngdeqqu.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

// ==================== ENDPOINTS ====================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Lovable Proxy Server',
    timestamp: new Date().toISOString(),
    supabase: 'connected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
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
    
    console.log('[SERVER] 📤 Enviando mensagem para projeto:', projectId);
    console.log('[SERVER] Mensagem:', message);
    
    if (!licenseKey || !projectId || !message) {
      return res.json({
        success: false,
        error: 'Dados incompletos'
      });
    }
    
    if (!token) {
      return res.json({
        success: false,
        error: 'Token não fornecido'
      });
    }
    
    // 1. Validar licença
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single();
    
    if (licenseError || !license) {
      console.error('[SERVER] ❌ Licença não encontrada:', licenseKey);
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
    
    // 3. Enviar mensagem para Firestore usando REST API com token do usuário
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/gpt-engineer-390607/databases/(default)/documents/projects/${projectId}/messages`;
    
    const messageData = {
      fields: {
        content: { stringValue: message },
        role: { stringValue: 'user' },
        timestamp: { timestampValue: new Date().toISOString() }
      }
    };
    
    if (files && files.length > 0) {
      messageData.fields.files = {
        arrayValue: {
          values: files.map(f => ({ stringValue: f }))
        }
      };
    }
    
    console.log('[SERVER] 🌐 Enviando para Firestore...');
    console.log('[SERVER] URL:', firestoreUrl);
    
    const firestoreResponse = await fetch(firestoreUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    console.log('[SERVER] 📥 Status Firestore:', firestoreResponse.status);
    
    if (!firestoreResponse.ok) {
      const errorText = await firestoreResponse.text();
      console.error('[SERVER] ❌ Erro Firestore:', errorText);
      throw new Error(`Firestore error: ${firestoreResponse.status} - ${errorText}`);
    }
    
    const result = await firestoreResponse.json();
    console.log('[SERVER] ✅ Mensagem enviada!', result.name);
    
    // 4. Descontar crédito
    const { error: updateError } = await supabase
      .from('licenses')
      .update({ 
        credits: license.credits - 1,
        updated_at: new Date().toISOString()
      })
      .eq('license_key', licenseKey);
    
    if (updateError) {
      console.error('[SERVER] ❌ Erro ao descontar crédito:', updateError);
    }
    
    // 5. Registrar uso
    const { error: logError } = await supabase
      .from('usage_logs')
      .insert({
        license_key: licenseKey,
        project_id: projectId,
        message_length: message.length
      });
    
    if (logError) {
      console.error('[SERVER] ❌ Erro ao registrar log:', logError);
    }
    
    res.json({
      success: true,
      messageId: result.name,
      creditsRemaining: license.credits - 1
    });
    
  } catch (error) {
    console.error('[SERVER] ❌ Erro ao enviar mensagem:', error);
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
