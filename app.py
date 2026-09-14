import os
import sys

# Ensure backend directory is in the Python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
backend_app_dir = os.path.join(backend_dir, "app")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

__path__ = [backend_app_dir]

from app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
