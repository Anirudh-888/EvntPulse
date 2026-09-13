from app.models.user import User, UserRole
from app.models.club import Club, ClubOrganizer
from app.models.event import Event

def can_manage_club(user: User, club: Club) -> bool:
    """
    Check if a user has management permissions for a club:
    - User is an Admin
    - User is the owner of the club
    - User is in the club's assigned organizers list
    """
    if not user or not club:
        return False
    if user.role == UserRole.ADMIN:
        return True
    if club.owner_id == user.id:
        return True
    # Check assigned organizers
    if club.organizers:
        if any(org.user_id == user.id for org in club.organizers):
            return True
    return False

def can_manage_event(user: User, event: Event) -> bool:
    """
    Check if a user has management permissions for an event:
    - User is an Admin
    - User is designated as one of the 2 RSVP managers (rsvp_email_1 or rsvp_email_2)
    - User can manage the event's host club
    """
    if not user or not event:
        return False
    if user.role == UserRole.ADMIN:
        return True
    
    # Check RSVP manager emails
    user_email = (user.email or "").strip().lower()
    if user_email:
        if event.rsvp_email_1 and event.rsvp_email_1.strip().lower() == user_email:
            return True
        if event.rsvp_email_2 and event.rsvp_email_2.strip().lower() == user_email:
            return True

    if event.club:
        return can_manage_club(user, event.club)
    return False
