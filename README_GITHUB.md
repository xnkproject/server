# 🚀 Lovable Proxy Server

Servidor proxy para extensão Lovable com sistema de licenças via Supabase.

## 📋 Sobre

Este servidor permite:
- ✅ Validar licenças de usuários
- ✅ Controlar créditos
- ✅ Enviar mensagens para Lovable via Firebase
- ✅ Registrar logs de uso
- ✅ Gerenciar HWID (1 dispositivo por licença)

## 🌐 Deploy

Este projeto está configurado para deploy na **Vercel**.

### Variáveis de Ambiente Necessárias

Configure no dashboard da Vercel:

- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_SERVICE_KEY` - Chave service_role do Supabase
- `FIREBASE_CLIENT_EMAIL` (opcional) - Email da conta de serviço Firebase
- `FIREBASE_PRIVATE_KEY` (opcional) - Chave privada Firebase

## 📡 Endpoints

### GET /
Health check básico

### GET /api/health
Status detalhado do servidor

### POST /api/validate-license
Valida chave de licença e HWID

### POST /api/send-message
Envia mensagem para Lovable (requer Firebase configurado)

### POST /api/get-credits
Retorna créditos disponíveis

### POST /api/add-credits
Adiciona créditos a uma licença

## 🔧 Desenvolvimento Local

```bash
npm install
npm start
```

## 📊 Estrutura do Banco (Supabase)

### Tabela: licenses
- `id` - UUID
- `license_key` - TEXT (chave da licença)
- `hwid` - TEXT (hardware ID)
- `credits` - INTEGER (créditos disponíveis)
- `is_active` - BOOLEAN (status)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Tabela: usage_logs
- `id` - UUID
- `license_key` - TEXT
- `project_id` - TEXT
- `message_length` - INTEGER
- `created_at` - TIMESTAMP

## 💰 Custos

- **Vercel**: Grátis (até 100GB bandwidth/mês)
- **Supabase**: Grátis (até 500MB database)
- **Total**: R$ 0,00/mês

## 📝 Licença

MIT
