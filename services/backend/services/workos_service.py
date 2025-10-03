"""WorkOS service for authentication and user management."""
from typing import Optional, Literal
from workos import WorkOSClient
from config import WORKOS_API_KEY, WORKOS_CLIENT_ID

UserManagementProviderType = Literal[
    "authkit",
    "AppleOAuth",
    "GitHubOAuth",
    "GoogleOAuth",
    "MicrosoftOAuth"
]

# Initialize WorkOS client
workos_client = WorkOSClient(api_key=WORKOS_API_KEY, client_id=WORKOS_CLIENT_ID)


def get_authorization_url(
    redirect_uri: str,
    state: Optional[str] = None,
    provider: Optional[UserManagementProviderType] = None,
    screen_hint: Optional[str] = None
) -> str:
    """
    Generate authorization URL for WorkOS AuthKit.
    
    Args:
        redirect_uri: Callback URL after authentication
        state: Optional state parameter for CSRF protection
        provider: Optional provider to skip selection screen (e.g., 'GoogleOAuth')
        screen_hint: Optional screen hint to show specific screen (e.g., 'sign-up')
    
    Returns:
        Authorization URL string
    """
    params = {
        "redirect_uri": redirect_uri,
        "state": state,
        "provider": provider,
    }
    
    # Add screen_hint if provided
    if screen_hint:
        params["screen_hint"] = screen_hint
    
    return workos_client.user_management.get_authorization_url(**params)


async def authenticate_with_code(code: str) -> dict:
    """
    Authenticate user with authorization code from AuthKit.
    
    Args:
        code: Authorization code from callback
    
    Returns:
        Dictionary containing access_token, refresh_token, and user info
    """
    response = workos_client.user_management.authenticate_with_code(
        code=code,
    )
    
    return {
        "access_token": response.access_token,
        "refresh_token": response.refresh_token,
        "user": {
            "id": response.user.id,
            "email": response.user.email,
            "first_name": response.user.first_name,
            "last_name": response.user.last_name,
            "email_verified": response.user.email_verified,
            "profile_picture_url": response.user.profile_picture_url,
        },
        "impersonator": response.impersonator,
    }


async def get_user_profile(user_id: str) -> dict:
    """
    Get user profile from WorkOS.
    
    Args:
        user_id: WorkOS user ID
    
    Returns:
        User profile dictionary
    """
    user = workos_client.user_management.get_user(user_id)
    
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email_verified": user.email_verified,
        "profile_picture_url": user.profile_picture_url,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


async def update_user_profile(user_id: str, first_name: Optional[str] = None, last_name: Optional[str] = None) -> dict:
    """
    Update user profile in WorkOS.
    
    Args:
        user_id: WorkOS user ID
        first_name: Optional new first name
        last_name: Optional new last name
    
    Returns:
        Updated user profile dictionary
    """
    update_data = {}
    if first_name is not None:
        update_data["first_name"] = first_name
    if last_name is not None:
        update_data["last_name"] = last_name
    
    user = workos_client.user_management.update_user(
        user_id=user_id,
        **update_data
    )
    
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email_verified": user.email_verified,
        "profile_picture_url": user.profile_picture_url,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


async def refresh_access_token(refresh_token: str) -> dict:
    """
    Refresh access token using refresh token.
    
    Args:
        refresh_token: Refresh token from previous authentication
    
    Returns:
        Dictionary containing new access_token and refresh_token
    """
    response = workos_client.user_management.authenticate_with_refresh_token(
        refresh_token=refresh_token,
    )
    
    return {
        "access_token": response.access_token,
        "refresh_token": response.refresh_token,
    }


async def get_logout_url(session_id: str) -> str:
    """
    Get logout URL for WorkOS session.
    
    Args:
        session_id: WorkOS session ID
    
    Returns:
        Logout URL string
    """
    return workos_client.user_management.get_logout_url(session_id=session_id)

