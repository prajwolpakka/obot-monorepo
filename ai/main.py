import os
from fastapi import FastAPI
from utils.logger import logger
from routes.main_router import main_router
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Chatbot Server",
    version='1.0',
    description="""
        ## Welcome to the Chatbot API

        - [API] Swagger UI: [**/docs**](./docs)
        - [DOC] ReDoc: [**/redoc**](./redoc)
        - [API] All API endpoints are prefixed with `/api`

        This API is designed to power an AI chatbot service.
    """,
    #lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(main_router, prefix='/api')

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to the Chatbot API",
        "docs": "Visit /docs for the interactive Swagger UI",
        "redoc": "Visit /redoc for the ReDoc documentation",
        "api_prefix": "/api",
    }


if __name__ == "__main__":
    host = os.getenv("AI_HOST", "0.0.0.0")
    port = int(os.getenv("AI_PORT", "6002"))
    logger.info(f"Starting the server on {host}:{port}...")
    uvicorn.run(app="main:app", host=host, port=port, reload=True)
    logger.info("Server started successfully")
