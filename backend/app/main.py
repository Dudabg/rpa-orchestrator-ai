from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import logs, metrics

# Cria as tabelas no SQLite automaticamente ao iniciar a aplicação
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RPA Orchestrator AI API", version="1.0.0")

# Configuração do CORS para permitir que o Frontend React se comunique sem restrições
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro dos Roteadores da API
app.include_router(logs.router)
app.include_router(metrics.router)


@app.get("/")
def root():
    return {"message": "API RPA Orchestrator AI operando perfeitamente!"}
