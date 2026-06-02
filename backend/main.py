from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, field_validator
from supabase import create_client
from dotenv import load_dotenv
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gamehub-omega-blond.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

METODOS_VALIDOS = {
    "pix", "boleto", "paypal", "applepay", "binance",
    "cartao_parcelado", "cartao_avista_visa",
    "cartao_avista_master", "cartao_avista_elo", "cartao_avista_amex"
}


class ItemCarrinho(BaseModel):
    title: str
    price: float
    thumbnail: str

    @field_validator("price")
    @classmethod
    def preco_positivo(cls, v):
        if v <= 0:
            raise ValueError("Preço deve ser positivo")
        return round(v, 2)

    @field_validator("title")
    @classmethod
    def title_valido(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Título inválido")
        return v[:200]


class CheckoutData(BaseModel):
    user_id: str
    metodo_pagamento: str
    itens: list[ItemCarrinho]

    @field_validator("itens")
    @classmethod
    def itens_validos(cls, v):
        if len(v) == 0:
            raise ValueError("Carrinho vazio")
        if len(v) > 50:
            raise ValueError("Muitos itens no carrinho")
        return v

    @field_validator("metodo_pagamento")
    @classmethod
    def metodo_valido(cls, v):
        if v not in METODOS_VALIDOS:
            raise ValueError("Método de pagamento inválido")
        return v


@app.get("/")
def home():
    return {"status": "GameHub backend online"}


@app.head("/")
def home_head():
    return Response()


@app.post("/checkout")
def checkout(data: CheckoutData):
    try:
        total = round(sum(item.price for item in data.itens), 2)

        pedido = supabase.table("pedidos").insert({
            "user_id": data.user_id,
            "total": total,
            "metodo_pagamento": data.metodo_pagamento,
            "status": "pendente"
        }).execute()

        if not pedido.data:
            return {"success": False, "error": "Falha ao criar pedido"}

        pedido_id = pedido.data[0]["id"]

        pedido_itens = [
            {
                "pedido_id": pedido_id,
                "title": item.title,
                "price": item.price,
                "thumbnail": item.thumbnail
            }
            for item in data.itens
        ]

        supabase.table("pedido_itens").insert(pedido_itens).execute()

        return {"success": True, "pedido_id": pedido_id}

    except Exception as e:
        logger.error("Erro no checkout: %s", e)
        return {"success": False, "error": "Erro interno. Tente novamente."}
