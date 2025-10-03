"""Authentication dependencies for FastAPI routes."""
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status, Header
from sqlmodel import Session
from schemas.auth_schemas import UserProfile
from services.workos_service import get_user_profile
from services.user_service import get_or_create_user
from db.session import get_session


async def get_current_user(
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
) -> UserProfile:
    """
    Dependency to get current authenticated user from JWT token.
    
    Validates the JWT access token from WorkOS, fetches the user profile,
    and ensures the user exists in the database.
    
    Args:
        authorization: Authorization header with Bearer token
        session: Database session
    
    Returns:
        UserProfile of authenticated user
    
    Raises:
        HTTPException: If user is not authenticated or token is invalid
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Decode JWT token without verification for now
        # In production, you should verify the signature using WorkOS public keys
        # See: https://workos.com/docs/user-management/guide/jwt-verification
        decoded_token = jwt.decode(
            token, 
            options={"verify_signature": False}  # TODO: Verify signature in production
        )
        
        # Extract user_id from token (WorkOS uses 'sub' for user ID, 'sid' is session ID)
        user_id = decoded_token.get('sub')
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user identifier",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Fetch user profile from WorkOS
        user_data = await get_user_profile(user_id)
        user_profile = UserProfile(**user_data)
        
        # Ensure user exists in database (create/update)
        get_or_create_user(session, user_profile)
        
        return user_profile
        
    except jwt.DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not decode token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
) -> Optional[UserProfile]:
    """
    Optional authentication dependency.
    
    Returns None if user is not authenticated instead of raising an exception.
    """
    if not authorization:
        return None
    
    try:
        return await get_current_user(authorization, session)
    except HTTPException:
        return None


