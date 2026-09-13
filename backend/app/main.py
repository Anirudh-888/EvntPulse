from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.database import Base, engine
import app.models # Load all models so tables are registered
from app.api import api_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Auto-seed MVJCE clubs, IT admin, and demo events if fresh database
try:
    from app.seed import seed_if_empty
    seed_if_empty()
except Exception as e:
    print(f"Auto-seed check notice: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart Campus & Club Event Intelligence Hub — The Campus Event Operating System.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global validation error formatting
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0]["msg"] if errors else "Invalid request data"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": first_error, "errors": errors},
    )

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

# Serve frontend build if dist directory exists
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check potential locations for frontend/dist
possible_dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend/dist")),
    os.path.abspath(os.path.join(os.getcwd(), "dist")),
]

dist_dir = next((p for p in possible_dist_paths if os.path.isdir(p)), None)

if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_root():
        return FileResponse(os.path.join(dist_dir, "index.html"))

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        # Allow API and Docs to pass through
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("health"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": "Welcome to EvntPulse API — Smart Campus & Club Event Intelligence Hub",
            "docs": "/docs",
            "api_v1": settings.API_V1_STR
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
