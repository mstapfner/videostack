"""User service for managing database users linked to WorkOS."""
from sqlmodel import Session, select
from models.user import User
from schemas.auth_schemas import UserProfile


def get_or_create_user(session: Session, user_profile: UserProfile) -> User:
    """
    Get or create a database user from WorkOS user profile.
    
    Args:
        session: Database session
        user_profile: WorkOS user profile
    
    Returns:
        Database User instance
    """
    # Try to find existing user by workos_user_id
    statement = select(User).where(User.workos_user_id == user_profile.id)
    user = session.exec(statement).first()
    
    if user:
        # Update user info if changed
        updated = False
        
        if user.email != user_profile.email:
            user.email = user_profile.email
            updated = True
        
        # Update name if available
        full_name = None
        if user_profile.first_name and user_profile.last_name:
            full_name = f"{user_profile.first_name} {user_profile.last_name}"
        elif user_profile.first_name:
            full_name = user_profile.first_name
        elif user_profile.last_name:
            full_name = user_profile.last_name
        
        if full_name and user.name != full_name:
            user.name = full_name
            updated = True
        
        if updated:
            session.add(user)
            session.commit()
            session.refresh(user)
        
        return user
    
    # Create new user
    full_name = None
    if user_profile.first_name and user_profile.last_name:
        full_name = f"{user_profile.first_name} {user_profile.last_name}"
    elif user_profile.first_name:
        full_name = user_profile.first_name
    elif user_profile.last_name:
        full_name = user_profile.last_name
    
    new_user = User(
        workos_user_id=user_profile.id,
        email=user_profile.email,
        name=full_name,
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return new_user

