from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, field_validator
from typing import Optional
from supabase import create_client
from dotenv import load_dotenv
import os
import logging
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gamehub-omega-blond.vercel.app",
        "http://localhost",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
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


# ── Auth ──────────────────────────────────────
class AuthUser:
    def __init__(self, id):
        self.id = id

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token não fornecido")
    token = authorization.split(" ", 1)[1]
    try:
        r = httpx.get(
            f"{os.getenv('SUPABASE_URL')}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": os.getenv("SUPABASE_ANON_KEY")
            },
            timeout=10
        )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Token inválido")
        data = r.json()
        if not data.get("id"):
            raise HTTPException(status_code=401, detail="Token inválido")
        return AuthUser(data["id"])
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


# ── Models ────────────────────────────────────
class ItemCarrinho(BaseModel):
    model_config = {"extra": "ignore"}

    title: str
    price: float
    thumbnail: Optional[str] = ""

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


# ── Rotas ─────────────────────────────────────
@app.get("/")
def home():
    return {"status": "GameHub backend online"}


@app.head("/")
def home_head():
    return Response()


@app.post("/checkout")
def checkout(data: CheckoutData, user=Depends(get_current_user)):
    try:
        total = round(sum(item.price for item in data.itens), 2)

        pedido = supabase.table("pedidos").insert({
            "user_id": user.id,
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

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro no checkout: %s", e)
        return {"success": False, "error": "Erro interno. Tente novamente."}
