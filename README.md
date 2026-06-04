# 🎮 GameHub

![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel&logoColor=white)
![Python](https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-database-3ecf8e?logo=supabase&logoColor=white)
![JavaScript](https://img.shields.io/badge/Frontend-JavaScript-f7df1e?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-green)

Esse projeto nasceu da vontade de entender como funcionam as coisas por baixo de uma loja digital de verdade — autenticação, carrinho, checkout, banco de dados, tudo junto. Resolvi construir uma plataforma de jogos inspirada na Steam e na Nuuvem pra colocar isso em prática.

Está deployado e funcionando: frontend no Vercel, backend no Render, banco no Supabase.

---

## Acesse

- 🌐 Site: https://gamehub-omega-blond.vercel.app/
- ⚙️ API: https://gamehub-sl9h.onrender.com

---

## O que dá pra fazer

- Criar conta e fazer login com e-mail e senha
- Buscar jogos em tempo real
- Favoritar jogos e ver a lista de desejos
- Adicionar ao carrinho e finalizar a compra
- Escolher forma de pagamento (Pix, cartão, PayPal, etc.)
- Acompanhar os pedidos com status colorido

---

## Tecnologias usadas

**Frontend:** HTML, CSS e JavaScript puro — sem framework, quis entender o DOM de verdade. Three.js pra cena 3D na tela de login.

**Backend:** Python com FastAPI. Aprendi bastante sobre validação de dados com Pydantic e como proteger uma API com JWT.

**Banco:** Supabase (PostgreSQL). Row Level Security ativado em todas as tabelas — cada usuário só acessa os próprios dados.

**Deploy:** Vercel (frontend) + Render (backend) + UptimeRobot pra manter o backend sempre acordado.

---

## Estrutura

```
gamehub/
├── frontend/    → HTML, CSS, JS, imagens
├── backend/     → API em Python (FastAPI)
└── README.md
```

---

## Screenshots

### Home
![Home](./frontend/images/homes.png)

### Login
![Login](./frontend/images/loginn.png)

### Checkout
![Checkout](./frontend/images/checkouts.png)

### Sucesso
![Sucesso](./frontend/images/sucessos.png)

---

Desenvolvido por Pedro Aruanã
