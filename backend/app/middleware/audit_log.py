from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time
from app.core.database import async_session_maker
from app.models.system_log import SystemLog
import asyncio

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        print(f"[EVIDENCE] AuditLogMiddleware intercepting: {request.url.path} (method: {getattr(request, 'method', 'NO_METHOD')})")
        start_time = time.time()
        
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise e
        finally:
            process_time = time.time() - start_time
            
            # Log requests that mutate data or are authentication related
            if request.method in ["POST", "PUT", "DELETE"] or "auth" in request.url.path:
                level = "INFO" if status_code < 400 else "ERROR"
                message = f"{request.method} {request.url.path} - {status_code}"
                
                details = {
                    "client_ip": request.client.host if request.client else "unknown",
                    "process_time_ms": round(process_time * 1000, 2),
                    "query_params": dict(request.query_params),
                }

                # We spin off a background task to write to the DB so we don't block the response
                asyncio.create_task(self.log_to_db(level, "AuditMiddleware", message, details))
                
        return response

    async def log_to_db(self, level, source, message, details):
        async with async_session_maker() as db:
            log_entry = SystemLog(
                level=level,
                source=source,
                message=message,
                details=details
            )
            db.add(log_entry)
            await db.commit()
