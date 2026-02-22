"""FastAPI dependency for Supabase JWT authentication."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.supabase_client import get_supabase

_bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """Validate token via Supabase auth.get_user(). Works with both HS256 and ES256 keys."""
    token = credentials.credentials
    try:
        sb = get_supabase()
        res = sb.auth.get_user(token)
        return {"sub": res.user.id, "email": res.user.email}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
