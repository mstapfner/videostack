"""Pydantic schemas for authentication."""
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserProfile(BaseModel):
    """User profile model."""
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email_verified: bool
    profile_picture_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class UpdateUserProfileRequest(BaseModel):
    """Request model for updating user profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class AuthResponse(BaseModel):
    """Authentication response model."""
    access_token: str
    refresh_token: str
    user: UserProfile
    impersonator: Optional[dict] = None


class LoginResponse(BaseModel):
    """Login URL response model."""
    auth_url: str


class CallbackRequest(BaseModel):
    """Callback request model."""
    code: str
    state: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Refresh token request model."""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Refresh token response model."""
    access_token: str
    refresh_token: str


class LogoutResponse(BaseModel):
    """Logout response model."""
    logout_url: str
    message: str


class SessionInfo(BaseModel):
    """Session information model."""
    user_id: str
    email: EmailStr
    authenticated: bool


