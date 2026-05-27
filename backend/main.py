from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
import os

# carregar .env
load_dotenv(dotenv_path=".env")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    return {
        "status": "GameHub backend online"
    }

# listar pedidos
@app.get("/pedidos")
def listar_pedidos():

    response = supabase.table("pedidos").select("*").execute()

    return response.data


# CHECKOUT REAL
@app.post("/checkout")
def checkout(data: dict):

    user_id = data["user_id"]
    metodo = data["metodo_pagamento"]
    itens = data["itens"]

    total = 0

    for item in itens:
        total += float(item["price"])

    # cria pedido
    pedido = supabase.table("pedidos").insert({
        "user_id": user_id,
        "total": total,
        "metodo_pagamento": metodo,
        "status": "pendente"
    }).execute()

    pedido_id = pedido.data[0]["id"]

    # cria itens
    pedido_itens = []

    for item in itens:

        pedido_itens.append({
            "pedido_id": pedido_id,
            "title": item["title"],
            "price": item["price"],
            "thumbnail": item["thumbnail"]
        })

    supabase.table("pedido_itens").insert(pedido_itens).execute()

    return {
        "success": True,
        "pedido_id": pedido_id
    }