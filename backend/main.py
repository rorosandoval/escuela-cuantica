from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import sys
import io
import contextlib

app = FastAPI()

# Permitir conexión desde el frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ejecutar")
async def ejecutar_codigo(request: Request):
    data = await request.json()
    codigo = data.get("code", "")

    output = io.StringIO()
    try:
        with contextlib.redirect_stdout(output):
            exec(codigo, {})
        resultado = output.getvalue()
    except Exception as e:
        resultado = f"Error: {e}"

    return {"output": resultado}
