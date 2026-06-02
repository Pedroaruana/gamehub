from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from supabase import create_client
from dotenv import load_dotenv
import os

# carregar .env
load_dotenv(".env")

app = FastAPI()

# CORS (produção segura)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gamehub-omega-blond.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# conectar supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# rota inicial
@app.get("/")
def home():
    return {"status": "GameHub backend online"}

# suporte a HEAD para UptimeRobot
@app.head("/")
def home_head():
    return Response()

# listar pedidos
@app.get("/pedidos")
def listar_pedidos():
    response = supabase.table("pedidos").select("*").execute()
    return response.data


# CHECKOUT REAL (CORRIGIDO)
@app.post("/checkout")
def checkout(data: dict):

    try:
        user_id = data.get("user_id")
        metodo = data.get("metodo_pagamento")
        itens = data.get("itens", [])

        if not user_id or not itens:
            return {"success": False, "error": "dados inválidos"}

        total = sum(float(item.get("price", 0)) for item in itens)

        pedido = supabase.table("pedidos").insert({
            "user_id": user_id,
            "total": total,
            "metodo_pagamento": metodo,
            "status": "pendente"
        }).execute()

        if not pedido.data:
            return {"success": False, "error": "falha ao criar pedido"}

        pedido_id = pedido.data[0]["id"]

        pedido_itens = [
            {
                "pedido_id": pedido_id,
                "title": item.get("title"),
                "price": item.get("price"),
                "thumbnail": item.get("thumbnail")
            }
            for item in itens
        ]

        supabase.table("pedido_itens").insert(pedido_itens).execute()

        return {
            "success": True,
            "pedido_id": pedido_id
        }

    except Exception as e:
        print("ERRO CHECKOUT:", e)
        return {
            "success": False,
            "error": str(e)
        }