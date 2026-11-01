from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers.book_router import router as book_router

app = FastAPI(title="Livraria API")

# 1. Libera o CORS para evitar bloqueios do navegador
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Inclui todas as rotas de /books (deve vir ANTES do StaticFiles!)
app.include_router(book_router)

# 3. Serve a pasta 'frontend' na raiz (http://127.0.0.1:8000)
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
