# 🎮 GameHub — Full Stack Game Store

![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel&logoColor=white)
![Python](https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-database-3ecf8e?logo=supabase&logoColor=white)
![JavaScript](https://img.shields.io/badge/Frontend-JavaScript-f7df1e?logo=javascript&logoColor=black)

GameHub é uma plataforma full stack de e-commerce de jogos digitais, inspirada em plataformas como Steam e Nuuvem. O sistema permite listar jogos, favoritar, adicionar ao carrinho, finalizar compras, acompanhar pedidos e muito mais — com autenticação real e banco de dados integrado.


---

## 🚀 Demo

- 🌐 Frontend (Vercel): https://gamehub-omega-blond.vercel.app/
- ⚙️ Backend (Render): https://gamehub-sl9h.onrender.com
- 🗄️ Database: Supabase

---

## 🧠 Funcionalidades

### 🔐 Autenticação
- Cadastro e login com e-mail e senha
- Sessão persistente via Supabase Auth
- Logout instantâneo sem recarregar a página

### 🛒 E-commerce
- Listagem de jogos com cards interativos
- Busca em tempo real por nome
- Página de detalhes de cada jogo
- Carrinho de compras com dropdown no header
- Cálculo automático de total
- Checkout com múltiplas formas de pagamento

### ❤️ Favoritos
- Favoritar/desfavoritar jogos
- Lista de desejos no hero
- Menu lateral com jogos favoritados

### 📋 Meus Pedidos
- Dropdown de pedidos no header
- Exibe valor, método de pagamento, data e status
- Status colorido: pendente, aprovado, entregue, cancelado
- Abre automaticamente após finalizar compra

### ⚙️ Backend API (FastAPI)
- API REST com endpoint de checkout
- Registro de pedidos e itens no banco
- Integração com Supabase PostgreSQL

---

## 🔥 Tecnologias

### Frontend
- HTML5 / CSS3 / JavaScript
- Three.js (cena 3D na tela de login)
- Supabase JS SDK
- Deploy: Vercel

### Backend
- Python 3 + FastAPI + Uvicorn
- python-dotenv
- Deploy: Render
- Uptime monitorado via UptimeRobot (ping a cada 5 min)

### Banco de Dados
- Supabase (PostgreSQL)
- Tabelas: `pedidos`, `pedido_itens`, `favoritos`, `carrinho`

---

## 📁 Estrutura do Projeto

```
gamehub/
├── frontend/          # HTML, CSS, JS, imagens
│   ├── index.html
│   ├── login.html
│   ├── checkout.html
│   ├── detalhes.html
│   ├── sucesso.html
│   ├── style.css
│   ├── script.js
│   └── ...
├── backend/           # API Python
│   ├── main.py
│   └── requirements.txt
└── README.md
```

---

📌 Status do Projeto
✔ Frontend online
✔ Backend deployado
✔ API funcionando
✔ Banco integrado
✔ Checkout operacional
✔ Uptime monitorado (backend sempre ativo)

## 📸 Screenshots do projeto

### 🏠 Home
![Home](./frontend/images/homes.png)

### 🛒 Login
![Login](./frontend/images/loginn.png)

### 💳 Checkout
![Checkout](./frontend/images/checkouts.png)

### 🎉 Sucesso
![Sucesso](./frontend/images/sucessos.png)


👨‍💻 Autor

Desenvolvido por Pedro Aruanã 🚀