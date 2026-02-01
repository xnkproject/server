# 🚀 GUIA DE DEPLOY RÁPIDO

## Opção 1: Deploy Automático (MAIS FÁCIL)

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Fazer Login

```bash
vercel login
```

### Passo 3: Deploy

```bash
cd server
vercel
```

Quando perguntar:
- **Set up and deploy?** → YES
- **Which scope?** → Sua conta
- **Link to existing project?** → NO
- **Project name?** → lovable-proxy (ou outro nome)
- **Directory?** → . (ponto)
- **Override settings?** → NO

### Passo 4: Adicionar Variáveis de Ambiente

```bash
# Adicionar SUPABASE_URL
vercel env add SUPABASE_URL production
# Cole: https://iaefzzoqnnxmnngdeqqu.supabase.co

# Adicionar SUPABASE_SERVICE_KEY
vercel env add SUPABASE_SERVICE_KEY production
# Cole: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWZ6em9xbm54bW5uZ2RlcXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk1ODIyMywiZXhwIjoyMDg1NTM0MjIzfQ.TNWrclWvYAimNqDj_fLqbKF6feK29UORR4kpdfns0gs
```

### Passo 5: Deploy Production

```bash
vercel --prod
```

**PRONTO!** Anote a URL que aparecer (ex: https://lovable-proxy.vercel.app)

---

## Opção 2: Deploy via GitHub (ALTERNATIVA)

### Passo 1: Criar Repositório

```bash
cd server
git init
git add .
git commit -m "Initial commit"
```

### Passo 2: Push para GitHub

1. Crie um repositório no GitHub
2. Execute:

```bash
git remote add origin https://github.com/seu-usuario/lovable-proxy.git
git branch -M main
git push -u origin main
```

### Passo 3: Importar no Vercel

1. Acesse: https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione seu repositório
4. Clique em "Import"

### Passo 4: Configurar Variáveis

No dashboard do Vercel:
1. Vá em "Settings" → "Environment Variables"
2. Adicione:

**SUPABASE_URL**
```
https://iaefzzoqnnxmnngdeqqu.supabase.co
```

**SUPABASE_SERVICE_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWZ6em9xbm54bW5uZ2RlcXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk1ODIyMywiZXhwIjoyMDg1NTM0MjIzfQ.TNWrclWvYAimNqDj_fLqbKF6feK29UORR4kpdfns0gs
```

### Passo 5: Deploy

Clique em "Deploy"

**PRONTO!** Anote a URL do projeto.

---

## 🧪 Testar o Deploy

### 1. Testar Health Check

```bash
curl https://SUA-URL.vercel.app/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "firebase": false,
  "supabase": true
}
```

### 2. Testar Validação de Licença

```bash
curl -X POST https://SUA-URL.vercel.app/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"TEST-1234-5678-9012","hwid":"test123"}'
```

Deve retornar:
```json
{
  "success": true,
  "credits": 1000,
  "isActive": true
}
```

### 3. Testar Obter Créditos

```bash
curl -X POST https://SUA-URL.vercel.app/api/get-credits \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"TEST-1234-5678-9012"}'
```

Deve retornar:
```json
{
  "success": true,
  "credits": 1000,
  "isActive": true
}
```

---

## ✅ Checklist

- [ ] Vercel CLI instalado
- [ ] Login feito no Vercel
- [ ] Deploy executado
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy production feito
- [ ] URL anotada
- [ ] Health check testado
- [ ] Validação de licença testada

---

## 🎯 Próximo Passo

Agora que o servidor está no ar, você precisa:

1. **Anotar a URL do servidor** (ex: https://lovable-proxy.vercel.app)
2. **Atualizar a extensão** com essa URL
3. **Testar a extensão**

Veja o arquivo `../extension-pro/README.md` para instruções da extensão.

---

## 🆘 Problemas Comuns

### "Command not found: vercel"
```bash
npm install -g vercel
```

### "Not logged in"
```bash
vercel login
```

### "Environment variable not found"
```bash
# Adicionar novamente
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_KEY production

# Depois fazer redeploy
vercel --prod
```

### "Error 500" no servidor
- Verifique os logs: `vercel logs`
- Verifique se as variáveis estão corretas
- Verifique se o Supabase está acessível

---

## 💡 Dicas

1. **Sempre use `--prod`** para deploy de produção
2. **Guarde a URL** do servidor em local seguro
3. **Teste antes** de atualizar a extensão
4. **Monitore os logs** com `vercel logs`

---

## 🎉 Pronto!

Seu servidor está no ar! Agora é só atualizar a extensão e começar a usar! 🚀
