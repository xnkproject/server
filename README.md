# 🚀 Lovable Proxy Server

Servidor proxy para extensão Lovable com sistema de licenças via Supabase.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Vercel (grátis)
- Conta no Supabase (grátis)

## 🔧 Instalação Local

```bash
# Instalar dependências
npm install

# Copiar .env.example para .env
cp .env.example .env

# Editar .env com suas credenciais
# (já está configurado com suas credenciais do Supabase)

# Rodar servidor
npm start
```

O servidor estará rodando em: http://localhost:3000

## 🌐 Deploy no Vercel

### Opção 1: Via CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Adicionar variáveis de ambiente
vercel env add SUPABASE_URL
# Cole: https://iaefzzoqnnxmnngdeqqu.supabase.co

vercel env add SUPABASE_SERVICE_KEY
# Cole: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWZ6em9xbm54bW5uZ2RlcXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk1ODIyMywiZXhwIjoyMDg1NTM0MjIzfQ.TNWrclWvYAimNqDj_fLqbKF6feK29UORR4kpdfns0gs

# Deploy production
vercel --prod
```

### Opção 2: Via GitHub

1. Criar repositório no GitHub
2. Push do código
3. Importar no Vercel: https://vercel.com/new
4. Adicionar variáveis de ambiente no dashboard

## 🧪 Testar

### 1. Health Check

```bash
curl https://seu-projeto.vercel.app/api/health
```

### 2. Validar Licença

```bash
curl -X POST https://seu-projeto.vercel.app/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"TEST-1234-5678-9012","hwid":"abc123"}'
```

### 3. Obter Créditos

```bash
curl -X POST https://seu-projeto.vercel.app/api/get-credits \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"TEST-1234-5678-9012"}'
```

## 📡 Endpoints

### GET /
- Health check básico
- Retorna status do servidor

### GET /api/health
- Health check detalhado
- Retorna status Firebase e Supabase

### POST /api/validate-license
- Valida chave de licença
- Verifica HWID
- Retorna créditos disponíveis

**Body:**
```json
{
  "licenseKey": "TEST-1234-5678-9012",
  "hwid": "abc123"
}
```

### POST /api/send-message
- Envia mensagem para Lovable
- Desconta 1 crédito
- Registra log de uso

**Body:**
```json
{
  "licenseKey": "TEST-1234-5678-9012",
  "token": "token-do-lovable",
  "projectId": "project-id",
  "message": "Sua mensagem",
  "files": []
}
```

### POST /api/get-credits
- Retorna créditos disponíveis
- Verifica status da licença

**Body:**
```json
{
  "licenseKey": "TEST-1234-5678-9012"
}
```

### POST /api/add-credits
- Adiciona créditos a uma licença
- Endpoint administrativo

**Body:**
```json
{
  "licenseKey": "TEST-1234-5678-9012",
  "credits": 100
}
```

## 🔐 Variáveis de Ambiente

### Obrigatórias

- `SUPABASE_URL`: URL do seu projeto Supabase
- `SUPABASE_SERVICE_KEY`: Chave service_role do Supabase

### Opcionais (para enviar mensagens)

- `FIREBASE_CLIENT_EMAIL`: Email da conta de serviço Firebase
- `FIREBASE_PRIVATE_KEY`: Chave privada Firebase

## 📊 Estrutura do Banco (Supabase)

### Tabela: licenses

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| license_key | TEXT | Chave da licença |
| hwid | TEXT | Hardware ID |
| credits | INTEGER | Créditos disponíveis |
| is_active | BOOLEAN | Status da licença |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

### Tabela: usage_logs

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| license_key | TEXT | Chave da licença |
| project_id | TEXT | ID do projeto |
| message_length | INTEGER | Tamanho da mensagem |
| created_at | TIMESTAMP | Data do uso |

## 💰 Custos

- **Vercel**: Grátis (até 100GB bandwidth/mês)
- **Supabase**: Grátis (até 500MB database)
- **Total**: R$ 0,00/mês

## 🆘 Troubleshooting

### Erro: "Licença não encontrada"
- Verifique se executou o SQL no Supabase
- Verifique se a chave está correta

### Erro: "Firebase não configurado"
- Normal se não configurou Firebase ainda
- Servidor funciona sem Firebase (só não envia mensagens)

### Erro: "CORS"
- Já está configurado no servidor
- Se persistir, verifique URL da extensão

## 📝 Próximos Passos

1. ✅ Servidor criado
2. ✅ Supabase configurado
3. ⏳ Deploy no Vercel
4. ⏳ Configurar Firebase (opcional)
5. ⏳ Atualizar extensão com URL do servidor

## 🎉 Pronto!

Seu servidor está pronto para uso! Faça o deploy no Vercel e atualize a extensão.
