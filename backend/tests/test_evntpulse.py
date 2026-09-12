import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta, timezone

from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.main import app
from app.models.user import User, UserRole
from app.models.club import Club
from app.models.event import Event, EventStatus, EventCategory

TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_evntpulse.db"
test_engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    # Seed one of each role
    db = TestingSessionLocal()
    admin = User(
        name="Test Admin",
        email="admin@test.com",
        password_hash=get_password_hash("Password123!"),
        role=UserRole.ADMIN
    )
    organizer = User(
        name="Test Organizer",
        email="organizer@test.com",
        password_hash=get_password_hash("Password123!"),
        role=UserRole.ORGANIZER
    )
    student = User(
        name="Test Student",
        email="student@test.com",
        password_hash=get_password_hash("Password123!"),
        role=UserRole.STUDENT
    )
    db.add_all([admin, organizer, student])
    db.commit()

    # Seed Club
    club = Club(
        name="Robotics Club",
        description="Campus Robotics",
        owner_id=organizer.id
    )
    db.add(club)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)

def get_auth_token(email, password="Password123!"):
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200
    return resp.json()["access_token"]

# --- AUTH TESTS ---
def test_login_success():
    token = get_auth_token("student@test.com")
    assert token is not None

def test_login_invalid_password():
    resp = client.post("/api/v1/auth/login", json={"email": "student@test.com", "password": "WrongPassword"})
    assert resp.status_code == 401

def test_get_current_user():
    token = get_auth_token("student@test.com")
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "student@test.com"
    assert resp.json()["role"] == "STUDENT"

# --- EVENT CREATION & ROLE PROTECTION ---
def test_student_cannot_create_event():
    token = get_auth_token("student@test.com")
    resp = client.post("/api/v1/events", json={
        "club_id": 1,
        "title": "Unauthorized Event",
        "description": "desc",
        "category": "TECHNOLOGY",
        "venue": "Hall 1",
        "start_time": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
        "end_time": (datetime.now(timezone.utc) + timedelta(days=2, hours=3)).isoformat(),
        "registration_deadline": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "capacity": 50
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403

def test_organizer_create_and_publish_event():
    token = get_auth_token("organizer@test.com")
    resp = client.post("/api/v1/events", json={
        "club_id": 1,
        "title": "Robotics Championship",
        "description": "Grand autonomous rover battles",
        "category": "TECHNOLOGY",
        "venue": "Robo Arena",
        "start_time": (datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),
        "end_time": (datetime.now(timezone.utc) + timedelta(days=5, hours=4)).isoformat(),
        "registration_deadline": (datetime.now(timezone.utc) + timedelta(days=4)).isoformat(),
        "capacity": 2, # Small capacity to test limit
        "status": "DRAFT"
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    event_id = resp.json()["id"]

    # Publish
    pub_resp = client.post(f"/api/v1/events/{event_id}/publish", headers={"Authorization": f"Bearer {token}"})
    assert pub_resp.status_code == 200
    assert pub_resp.json()["status"] == "PUBLISHED"

# --- REGISTRATION & CAPACITY ---
def test_registration_flow_and_ticket_generation():
    token = get_auth_token("student@test.com")
    # Register for event 1
    resp = client.post("/api/v1/events/1/register", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["ticket"] is not None
    assert data["ticket"]["ticket_code"].startswith("EP-")
    assert "data:image/png;base64," in data["ticket"]["qr_code_image"]

def test_duplicate_registration_prevented():
    token = get_auth_token("student@test.com")
    resp = client.post("/api/v1/events/1/register", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 409

def test_capacity_handling():
    # Register second user (fills capacity of 2)
    client.post("/api/v1/auth/register", json={
        "name": "Second Student",
        "email": "student2@test.com",
        "password": "Password123!",
        "role": "STUDENT"
    })
    token2 = get_auth_token("student2@test.com")
    resp2 = client.post("/api/v1/events/1/register", headers={"Authorization": f"Bearer {token2}"})
    assert resp2.status_code == 201

    # Third user tries to register
    client.post("/api/v1/auth/register", json={
        "name": "Third Student",
        "email": "student3@test.com",
        "password": "Password123!",
        "role": "STUDENT"
    })
    token3 = get_auth_token("student3@test.com")
    resp3 = client.post("/api/v1/events/1/register", headers={"Authorization": f"Bearer {token3}"})
    assert resp3.status_code == 400
    assert "full" in resp3.json()["detail"].lower()

# --- ATTENDANCE & CHECK-IN ---
def test_check_in_flow():
    # Fetch ticket of student 1
    student_token = get_auth_token("student@test.com")
    my_regs = client.get("/api/v1/users/me/registrations", headers={"Authorization": f"Bearer {student_token}"}).json()
    ticket_code = my_regs[0]["ticket"]["ticket_code"]
    qr_token = my_regs[0]["ticket"]["qr_token"]

    organizer_token = get_auth_token("organizer@test.com")

    # Wrong event check-in test
    wrong_event_resp = client.post("/api/v1/attendance/check-in", json={
        "event_id": 999,
        "ticket_code": ticket_code
    }, headers={"Authorization": f"Bearer {organizer_token}"})
    assert wrong_event_resp.json()["status"] == "WRONG_EVENT"

    # Successful Check-in via QR Token
    checkin_resp = client.post("/api/v1/attendance/check-in", json={
        "event_id": 1,
        "qr_token": qr_token
    }, headers={"Authorization": f"Bearer {organizer_token}"})
    assert checkin_resp.json()["success"] is True
    assert checkin_resp.json()["status"] == "SUCCESS"

    # Duplicate check-in prevention
    dup_resp = client.post("/api/v1/attendance/check-in", json={
        "event_id": 1,
        "ticket_code": ticket_code
    }, headers={"Authorization": f"Bearer {organizer_token}"})
    assert dup_resp.json()["success"] is False
    assert dup_resp.json()["status"] == "ALREADY_CHECKED_IN"

# --- POLLS ---
def test_polls_flow():
    org_token = get_auth_token("organizer@test.com")
    # Create poll
    poll_resp = client.post("/api/v1/events/1/polls", json={
        "question": "Which rover design was most innovative?",
        "options": ["Hexapod Crawler", "Tracked Rover", "Hovercraft Prototype"]
    }, headers={"Authorization": f"Bearer {org_token}"})
    assert poll_resp.status_code == 201
    poll_id = poll_resp.json()["id"]
    option_id = poll_resp.json()["options"][0]["id"]

    # Student vote
    stu_token = get_auth_token("student@test.com")
    vote_resp = client.post(f"/api/v1/polls/{poll_id}/vote", json={"option_id": option_id}, headers={"Authorization": f"Bearer {stu_token}"})
    assert vote_resp.status_code == 200

    # Prevent duplicate vote
    dup_vote = client.post(f"/api/v1/polls/{poll_id}/vote", json={"option_id": option_id}, headers={"Authorization": f"Bearer {stu_token}"})
    assert dup_vote.status_code == 409

# --- FEEDBACK ---
def test_feedback_flow():
    stu_token = get_auth_token("student@test.com")
    # Student attended event 1, so feedback succeeds
    fb_resp = client.post("/api/v1/events/1/feedback", json={
        "rating": 5,
        "comment": "Incredible rover battles! Very well coordinated."
    }, headers={"Authorization": f"Bearer {stu_token}"})
    assert fb_resp.status_code == 201

    # Prevent duplicate feedback
    dup_fb = client.post("/api/v1/events/1/feedback", json={
        "rating": 4,
        "comment": "Another comment"
    }, headers={"Authorization": f"Bearer {stu_token}"})
    assert dup_fb.status_code == 409

    # Unattended student cannot submit feedback
    stu2_token = get_auth_token("student2@test.com")
    unattended_fb = client.post("/api/v1/events/1/feedback", json={
        "rating": 5,
        "comment": "I did not attend"
    }, headers={"Authorization": f"Bearer {stu2_token}"})
    assert unattended_fb.status_code == 403

# --- ANALYTICS & HEALTH SCORE ---
def test_analytics_and_health_score():
    resp = client.get("/api/v1/events/1/analytics")
    assert resp.status_code == 200
    data = resp.json()
    assert data["registrations"] == 2
    assert data["attendance"] == 1
    assert data["attendance_rate"] == 50.0
    assert data["average_rating"] == 5.0
    assert "health_breakdown" in data
    assert 0 <= data["event_health_score"] <= 100
    assert len(data["insights"]) > 0
