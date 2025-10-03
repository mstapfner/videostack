"""Authentication router for WorkOS integration."""
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query, Depends
from fastapi.responses import RedirectResponse
from sqlmodel import Session
from schemas.auth_schemas import (
    LoginResponse,
    AuthResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    LogoutResponse,
    SessionInfo,
    UserProfile,
    UpdateUserProfileRequest,
)
from services.workos_service import (
    get_authorization_url,
    authenticate_with_code,
    refresh_access_token,
    get_logout_url,
    get_user_profile,
    update_user_profile,
)
from services.user_service import get_or_create_user
from dependencies.auth_dependencies import get_current_user, get_current_user_optional
from db.session import get_session
from config import CLIENT_URL

auth_router = r = APIRouter()


@r.get("/login", response_model=LoginResponse)
async def login(
    state: Optional[str] = Query(default=None),
):
    """
    Generate authorization URL for WorkOS AuthKit.
    
    The redirect_uri is set to the backend callback URL where WorkOS will send
    the authorization code after successful authentication.
    
    Args:
        state: Optional state parameter for CSRF protection
    
    Returns:
        LoginResponse with authorization URL
    """
    try:
        # AuthKit will redirect to our backend callback after authentication
        backend_callback_url = "http://localhost:8000/api/auth/callback"
        
        auth_url = get_authorization_url(
            redirect_uri=backend_callback_url,
            state=state,
            provider="authkit",
        )
        return LoginResponse(auth_url=auth_url)
    except Exception as e:
        print(f"Failed to generate authorization URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate authorization URL: {str(e)}",
        )


@r.get("/signup", response_model=LoginResponse)
async def signup(
    state: Optional[str] = Query(default=None),
):
    """
    Generate authorization URL for WorkOS AuthKit with signup screen hint.
    
    Similar to login endpoint but shows signup screen by default.
    
    Args:
        state: Optional state parameter for CSRF protection
    
    Returns:
        LoginResponse with authorization URL
    """
    try:
        # AuthKit will redirect to our backend callback after authentication
        backend_callback_url = "http://localhost:8000/api/auth/callback"
        
        auth_url = get_authorization_url(
            redirect_uri=backend_callback_url,
            state=state,
            provider="authkit",
            screen_hint="sign-up",
        )
        return LoginResponse(auth_url=auth_url)
    except Exception as e:
        print(f"Failed to generate authorization URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate authorization URL: {str(e)}",
        )


@r.get("/callback")
async def auth_callback(
    code: str = Query(...),
    state: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    """
    Handle OAuth callback from WorkOS AuthKit.
    
    WorkOS redirects here with an authorization code after successful authentication.
    We exchange the code for tokens and user profile, create/update the user in database,
    then redirect to the frontend success page with the tokens.
    
    Args:
        code: Authorization code from WorkOS
        state: Optional state parameter for CSRF validation
        session: Database session
    
    Returns:
        Redirects to client URL with tokens in query params
    """
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code is required",
        )
    
    try:
        # Exchange authorization code for tokens and user profile
        # AuthKit doesn't require redirect_uri for token exchange
        auth_data = await authenticate_with_code(code=code)
        
        # Create or update user in database
        user_profile = UserProfile(**auth_data['user'])
        db_user = get_or_create_user(session, user_profile)
        
        # Redirect to frontend success page with tokens
        # Note: In production, consider using httpOnly cookies for better security
        redirect_url = (
            f"{CLIENT_URL}/auth/success"
            f"?access_token={auth_data['access_token']}"
            f"&refresh_token={auth_data['refresh_token']}"
            f"&user_id={auth_data['user']['id']}"
        )
        
        return RedirectResponse(url=redirect_url)
    except Exception as e:
        print(f"Authentication failed: {str(e)}")
        error_url = f"{CLIENT_URL}/auth/error?message={str(e)}"
        return RedirectResponse(url=error_url)


@r.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token.
    
    Args:
        request: RefreshTokenRequest with refresh_token
    
    Returns:
        RefreshTokenResponse with new tokens
    """
    if not request.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required",
        )
    
    try:
        tokens = await refresh_access_token(request.refresh_token)
        return RefreshTokenResponse(**tokens)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Failed to refresh token: {str(e)}",
        )


@r.post("/logout", response_model=LogoutResponse)
async def logout(session_id: str = Query(...)):
    """
    Logout user and get logout URL.
    
    Args:
        session_id: WorkOS session ID
    
    Returns:
        LogoutResponse with logout URL
    """
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID is required",
        )
    
    try:
        logout_url = await get_logout_url(session_id)
        return LogoutResponse(
            logout_url=logout_url,
            message="Logout successful",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to logout: {str(e)}",
        )


@r.get("/me", response_model=UserProfile)
async def get_current_user_info(
    current_user: UserProfile = Depends(get_current_user),
):
    """
    Get current authenticated user information.
    
    Requires authentication via Bearer token in Authorization header.
    
    Returns:
        UserProfile of authenticated user
    """
    return current_user


@r.put("/me", response_model=UserProfile)
async def update_current_user_info(
    profile_update: UpdateUserProfileRequest,
    current_user: UserProfile = Depends(get_current_user),
):
    """
    Update current authenticated user profile.
    
    Requires authentication via Bearer token in Authorization header.
    
    Args:
        profile_update: UpdateUserProfileRequest with fields to update
    
    Returns:
        Updated UserProfile
    """
    try:
        updated_user = await update_user_profile(
            user_id=current_user.id,
            first_name=profile_update.first_name,
            last_name=profile_update.last_name,
        )
        return UserProfile(**updated_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}",
        )


@r.get("/session", response_model=SessionInfo)
async def get_session_info(
    current_user: Optional[UserProfile] = Depends(get_current_user_optional),
):
    """
    Get current session information.
    
    Returns session status and user info if authenticated.
    
    Returns:
        SessionInfo with authentication status
    """
    if current_user:
        return SessionInfo(
            user_id=current_user.id,
            email=current_user.email,
            authenticated=True,
        )
    
    return SessionInfo(
        user_id="",
        email="",
        authenticated=False,
    )


@r.get("/user/{user_id}", response_model=UserProfile)
async def get_user(
    user_id: str,
    current_user: UserProfile = Depends(get_current_user),
):
    """
    Get user profile by user ID.
    
    Requires authentication. Users can only access their own profile
    unless they have admin privileges (not implemented here).
    
    Args:
        user_id: WorkOS user ID
    
    Returns:
        UserProfile of requested user
    """
    # Basic authorization: users can only access their own profile
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user profile",
        )
    
    try:
        user_data = await get_user_profile(user_id)
        return UserProfile(**user_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found: {str(e)}",
        )