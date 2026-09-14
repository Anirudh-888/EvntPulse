import random
from datetime import datetime, timedelta, timezone
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash, generate_ticket_code, generate_qr_token
from app.models.user import User, UserRole
from app.models.club import Club, ClubOrganizer
from app.models.event import Event, EventStatus, EventCategory
from app.models.registration import Registration, RegistrationStatus
from app.models.ticket import Ticket
from app.models.attendance import Attendance
from app.models.poll import Poll, PollOption, PollResponse, PollStatus
from app.models.feedback import Feedback
from app.models.notification import Notification

def seed_database(drop_existing: bool = True):
    print("Starting database seeding for EvntPulse (MVJCE Ecosystem)...")
    if drop_existing:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    now = datetime.now(timezone.utc)

    # 1. Platform Admin - MVJCE Software & IT Administration
    admin_user = User(
        name="MVJCE IT Administration",
        email="it.admin@mvjce.edu.in",
        password_hash=get_password_hash("Admin@123"),
        role=UserRole.ADMIN,
        college="MVJ College of Engineering",
        department="Information Technology",
        year="Faculty Admin",
        profile_image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    )
    db.add(admin_user)

    # 2. Single Student Account (as specified)
    demo_student = User(
        name="Arjun Sharma",
        email="student@mvjce.edu.in",
        password_hash=get_password_hash("Student@123"),
        role=UserRole.STUDENT,
        college="MVJ College of Engineering",
        department="Computer Science & Engineering",
        year="3rd Year",
        profile_image="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
    )
    db.add(demo_student)

    # 3. Official Club Accounts (9 Clubs)
    club_meta = [
        {
            "name": "Software Development Club MVJCE",
            "email": "sdc@mvjce.edu.in",
            "desc": "Official software development and competitive programming hub of MVJCE. Building production-grade apps, open-source projects, and full-stack solutions.",
            "logo": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200",
            "category": EventCategory.TECHNOLOGY,
            "dept": "Computer Science & Engineering"
        },
        {
            "name": "Google Developers Club MVJCE",
            "email": "gdc@mvjce.edu.in",
            "desc": "Fostering developer innovation, Google Cloud technologies, Android development, and machine learning workshops at MVJCE.",
            "logo": "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200",
            "category": EventCategory.TECHNOLOGY,
            "dept": "Information Science & Engineering"
        },
        {
            "name": "AWS Student Builder Club MVJCE",
            "email": "aws.club@mvjce.edu.in",
            "desc": "Empowering students in cloud computing, serverless architectures, DevOps, AWS certifications, and cloud architecture challenges.",
            "logo": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200",
            "category": EventCategory.TECHNOLOGY,
            "dept": "Computer Science & Engineering"
        },
        {
            "name": "TedX Club MVJCE",
            "email": "tedx@mvjce.edu.in",
            "desc": "Spreading ideas worth sharing. Organizing official independently organized TEDx talks, inspirational keynotes, and thought leadership forums.",
            "logo": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=200",
            "category": EventCategory.SEMINAR,
            "dept": "Humanities & Sciences"
        },
        {
            "name": "NIC Club MVJCE",
            "email": "nic@mvjce.edu.in",
            "desc": "National Informatics and Robotics cell at MVJCE. Advancing embedded hardware, IoT innovations, autonomous micro-systems, and cybersecurity.",
            "logo": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200",
            "category": EventCategory.TECHNOLOGY,
            "dept": "Electronics & Communication"
        },
        {
            "name": "Raagabhinaya Club MVJCE",
            "email": "raagabhinaya@mvjce.edu.in",
            "desc": "The premier drama, street play (Nukkad Natak), theatrical production, and expressive performing arts society of MVJCE.",
            "logo": "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=200",
            "category": EventCategory.CULTURAL,
            "dept": "Cultural Arts"
        },
        {
            "name": "Dhwani Club MVJCE",
            "email": "dhwani@mvjce.edu.in",
            "desc": "The official music and acoustic society of MVJCE. Fostering vocal ensembles, instrumental bands, fusion performances, and live campus concerts.",
            "logo": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200",
            "category": EventCategory.CULTURAL,
            "dept": "Music & Performing Arts"
        },
        {
            "name": "Saahitya Club MVJCE",
            "email": "saahitya@mvjce.edu.in",
            "desc": "Celebrating literary arts, creative writing, poetry slams, debates, book clubs, and linguistic heritage at MVJCE.",
            "logo": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=200",
            "category": EventCategory.CULTURAL,
            "dept": "Languages & Literature"
        },
        {
            "name": "Toastmasters Club MVJCE",
            "email": "toastmasters@mvjce.edu.in",
            "desc": "Empowering students in public speaking, impromptu table topics, leadership dynamics, and executive communication excellence.",
            "logo": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200",
            "category": EventCategory.SEMINAR,
            "dept": "Professional Development"
        },
    ]

    club_pw_hash = get_password_hash("Club@123")
    created_club_users = []
    created_clubs = []

    for c_info in club_meta:
        # Create organizer user account for each club
        club_user = User(
            name=f"{c_info['name']} Lead",
            email=c_info["email"],
            password_hash=club_pw_hash,
            role=UserRole.ORGANIZER,
            college="MVJ College of Engineering",
            department=c_info["dept"],
            year="Executive Board",
            profile_image=c_info["logo"]
        )
        db.add(club_user)
        created_club_users.append(club_user)

    db.commit()

    # Now create the Club entries linked to their organizer account
    for i, c_info in enumerate(club_meta):
        club_obj = Club(
            name=c_info["name"],
            email=c_info["email"],
            description=c_info["desc"],
            logo_url=c_info["logo"],
            owner_id=created_club_users[i].id
        )
        db.add(club_obj)
        created_clubs.append(club_obj)

    db.commit()
    print(f"Created {len(created_clubs)} Official MVJCE Clubs with club emails.")

    # 4. Events across the 9 Clubs with 2 RSVP Manager Emails each
    # Included are PUBLISHED, PENDING_APPROVAL (for Admin testing), DRAFT, and COMPLETED events.
    event_templates = [
        # SDC MVJCE (idx 0)
        {
            "club_idx": 0,
            "title": "MVJCE DevFest 2026: Code & Innovate",
            "desc": "Flagship annual hackathon hosted by Software Development Club MVJCE. Build full-stack solutions, AI integrations, and mobile applications with guidance from industry alumni mentors.",
            "category": EventCategory.HACKATHON,
            "venue": "Smt. Rajalakshmi Jayaraman Seminar Hall & CS Labs",
            "start": now + timedelta(days=6, hours=3),
            "end": now + timedelta(days=7, hours=6),
            "deadline": now + timedelta(days=5, hours=22),
            "cap": 150,
            "poster": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
            "status": EventStatus.PUBLISHED,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "sdc.rsvp@mvjce.edu.in"
        },
        {
            "club_idx": 0,
            "title": "Clean Code & Fast APIs Workshop",
            "desc": "Hands-on engineering workshop exploring FastAPI, PostgreSQL optimization, async Python pipelines, and clean architecture principles for modern web backends.",
            "category": EventCategory.WORKSHOP,
            "venue": "Computing Complex Lab 5, 2nd Floor",
            "start": now + timedelta(days=10, hours=2),
            "end": now + timedelta(days=10, hours=6),
            "deadline": now + timedelta(days=9, hours=20),
            "cap": 75,
            "poster": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
            "status": EventStatus.PENDING_APPROVAL,  # Pending Admin Approval
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "sdc.rsvp@mvjce.edu.in"
        },

        # GDC MVJCE (idx 1)
        {
            "club_idx": 1,
            "title": "Google Cloud & Agentic AI Hands-on Lab",
            "desc": "Explore Vertex AI, Gemini models, and build autonomous agents using Python. Certificate of completion provided by Google Developer Club MVJCE.",
            "category": EventCategory.TECHNOLOGY,
            "venue": "Auditorium 3, MVJCE Campus",
            "start": now + timedelta(days=4, hours=4),
            "end": now + timedelta(days=4, hours=8),
            "deadline": now + timedelta(days=3, hours=22),
            "cap": 120,
            "poster": "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800",
            "status": EventStatus.PUBLISHED,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "gdc.coordinator@mvjce.edu.in"
        },

        # AWS Student Builder Club MVJCE (idx 2)
        {
            "club_idx": 2,
            "title": "AWS Cloud Practitioner & Serverless Summit",
            "desc": "Step-by-step masterclass on AWS Lambda, DynamoDB, API Gateway, and Cloud Architecture best practices tailored for campus builders.",
            "category": EventCategory.WORKSHOP,
            "venue": "Mechanical Block Seminar Hall",
            "start": now + timedelta(days=8, hours=2),
            "end": now + timedelta(days=8, hours=6),
            "deadline": now + timedelta(days=7, hours=18),
            "cap": 90,
            "poster": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
            "status": EventStatus.PUBLISHED,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "aws.builder@mvjce.edu.in"
        },
        {
            "club_idx": 2,
            "title": "AWS GameDay: Microservices Challenge",
            "desc": "Competitive team simulation where students manage live cloud architectures under chaos scenarios and heavy traffic spikes.",
            "category": EventCategory.COMPETITION,
            "venue": "Cloud Computing Center, Block 2",
            "start": now + timedelta(days=15, hours=3),
            "end": now + timedelta(days=15, hours=8),
            "deadline": now + timedelta(days=14, hours=20),
            "cap": 60,
            "poster": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
            "status": EventStatus.PENDING_APPROVAL,  # Pending Admin Approval
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "aws.builder@mvjce.edu.in"
        },

        # TedX Club MVJCE (idx 3)
        {
            "club_idx": 3,
            "title": "TEDxMVJCE 2026: Uncharted Horizons",
            "desc": "Official independently organized TED event at MVJCE. Featuring 6 visionary speakers covering biotechnology, creative arts, entrepreneurial grit, and AI ethics.",
            "category": EventCategory.SEMINAR,
            "venue": "MVJCE Central Grand Auditorium",
            "start": now + timedelta(days=12, hours=4),
            "end": now + timedelta(days=12, hours=9),
            "deadline": now + timedelta(days=11, hours=23),
            "cap": 300,
            "poster": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
            "status": EventStatus.PUBLISHED,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "tedx.curator@mvjce.edu.in"
        },

        # NIC Club MVJCE (idx 4)
        {
            "club_idx": 4,
            "title": "Robotics & Micro-Drone Expo 2026",
            "desc": "Autonomous obstacle-avoiding rovers and FPV drone flight demonstrations engineered by the National Informatics Club MVJCE.",
            "category": EventCategory.TECHNOLOGY,
            "venue": "Outdoor Sports Ground & Robotics Arena",
            "start": now + timedelta(days=5, hours=5),
            "end": now + timedelta(days=5, hours=8),
            "deadline": now + timedelta(days=4, hours=20),
            "cap": 120,
            "poster": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
            "status": EventStatus.PUBLISHED,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "nic.hardware@mvjce.edu.in"
        },

        # Raagabhinaya Club MVJCE (idx 5)
        {
            "club_idx": 5,
            "title": "Rangmanch: Annual Theatre & Nukkad Natak Fest",
            "desc": "Gripping stage plays, mono-acting competitions, and high-energy street theatre highlighting impactful social themes.",
            "category": EventCategory.CULTURAL,
            "venue": "Open Air Amphitheatre, MVJCE",
            "start": now + timedelta(days=14, hours=4),
            "end": now + timedelta(days=14, hours=8),
            "deadline": now + timedelta(days=13, hours=22),
            "cap": 250,
            "poster": "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=800",
            "status": EventStatus.PUBLISHED,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "raaga.stage@mvjce.edu.in"
        },

        # Dhwani Club MVJCE (idx 6)
        {
            "club_idx": 6,
            "title": "Acoustic Resonance: Spring Live Concert",
            "desc": "An electrifying evening of rock, classical fusion, acoustic melodies, and collaborative campus bands presented by Dhwani Club MVJCE.",
            "category": EventCategory.CULTURAL,
            "venue": "Main College Quadrangle",
            "start": now + timedelta(days=7, hours=5),
            "end": now + timedelta(days=7, hours=10),
            "deadline": now + timedelta(days=6, hours=23),
            "cap": 400,
            "poster": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
            "status": EventStatus.PUBLISHED,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "dhwani.sound@mvjce.edu.in"
        },

        # Saahitya Club MVJCE (idx 7)
        {
            "club_idx": 7,
            "title": "Kavyanjali: Inter-Collegiate Poetry & Debate Conclave",
            "desc": "Celebrating expressive Kannada, English, and Hindi literature, parliamentary debate, creative writing, and poetry slams.",
            "category": EventCategory.CULTURAL,
            "venue": "Library Conference Hall, 3rd Floor",
            "start": now + timedelta(days=9, hours=3),
            "end": now + timedelta(days=9, hours=7),
            "deadline": now + timedelta(days=8, hours=21),
            "cap": 80,
            "poster": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800",
            "status": EventStatus.PUBLISHED,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "saahitya.lit@mvjce.edu.in"
        },

        # Toastmasters Club MVJCE (idx 8)
        {
            "club_idx": 8,
            "title": "Master the Stage: Impromptu Speaking & Leadership Duel",
            "desc": "Overcome stage fright with constructive evaluations, table topics, and speech craft workshops led by Toastmasters International mentors.",
            "category": EventCategory.SEMINAR,
            "venue": "Placement Auditorium, Ground Floor",
            "start": now + timedelta(days=3, hours=2),
            "end": now + timedelta(days=3, hours=5),
            "deadline": now + timedelta(days=2, hours=20),
            "cap": 70,
            "poster": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
            "status": EventStatus.PUBLISHED,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "toastmasters.vp@mvjce.edu.in"
        },

        # Completed Event (for historical ratings, analytics, and check-in records)
        {
            "club_idx": 0,
            "title": "Full-Stack Web Development Bootcamp",
            "desc": "Intensive hands-on training on modern JavaScript, React components, state management, and backend RESTful architectures.",
            "category": EventCategory.WORKSHOP,
            "venue": "CS Lab 3 & 4",
            "start": now - timedelta(days=3, hours=6),
            "end": now - timedelta(days=3, hours=2),
            "deadline": now - timedelta(days=4, hours=12),
            "cap": 60,
            "poster": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
            "status": EventStatus.COMPLETED,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "sdc.rsvp@mvjce.edu.in"
        },

        # Draft Event
        {
            "club_idx": 8,
            "title": "Corporate Elevator Pitch Championship (Draft)",
            "desc": "Draft session plan for the upcoming 60-second venture pitch challenge.",
            "category": EventCategory.COMPETITION,
            "venue": "Boardroom 101",
            "start": now + timedelta(days=25, hours=2),
            "end": now + timedelta(days=25, hours=6),
            "deadline": now + timedelta(days=24, hours=20),
            "cap": 50,
            "poster": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
            "status": EventStatus.DRAFT,
            "rsvp_1": "student@mvjce.edu.in",
            "rsvp_2": "toastmasters.vp@mvjce.edu.in"
        }
    ]

    created_events = []
    for tmpl in event_templates:
        ev = Event(
            club_id=created_clubs[tmpl["club_idx"]].id,
            title=tmpl["title"],
            description=tmpl["desc"],
            category=tmpl["category"],
            venue=tmpl["venue"],
            start_time=tmpl["start"],
            end_time=tmpl["end"],
            registration_deadline=tmpl["deadline"],
            capacity=tmpl["cap"],
            poster_url=tmpl["poster"],
            status=tmpl["status"],
            rsvp_email_1=tmpl.get("rsvp_1"),
            rsvp_email_2=tmpl.get("rsvp_2")
        )
        db.add(ev)
        created_events.append(ev)

    db.commit()
    print(f"Created {len(created_events)} MVJCE Events with RSVP manager emails and approval statuses.")

    # 5. Registrations, Tickets, and Attendance for the single student account
    upcoming_published_1 = created_events[0]  # DevFest
    upcoming_published_2 = created_events[2]  # Google Cloud Lab
    completed_event = created_events[-2]      # Full-Stack Bootcamp

    # Registration 1: DevFest (Upcoming)
    reg_1 = Registration(
        user_id=demo_student.id,
        event_id=upcoming_published_1.id,
        registered_at=now - timedelta(days=1),
        status=RegistrationStatus.REGISTERED
    )
    db.add(reg_1)
    db.flush()

    ticket_1 = Ticket(
        registration_id=reg_1.id,
        ticket_code=generate_ticket_code(),
        qr_token=generate_qr_token(),
        issued_at=reg_1.registered_at,
        used=False
    )
    db.add(ticket_1)

    # Registration 2: Google Cloud Lab (Upcoming)
    reg_2 = Registration(
        user_id=demo_student.id,
        event_id=upcoming_published_2.id,
        registered_at=now - timedelta(hours=5),
        status=RegistrationStatus.REGISTERED
    )
    db.add(reg_2)
    db.flush()

    ticket_2 = Ticket(
        registration_id=reg_2.id,
        ticket_code=generate_ticket_code(),
        qr_token=generate_qr_token(),
        issued_at=reg_2.registered_at,
        used=False
    )
    db.add(ticket_2)

    # Registration 3: Completed Event (Attended + Feedback)
    reg_3 = Registration(
        user_id=demo_student.id,
        event_id=completed_event.id,
        registered_at=completed_event.start_time - timedelta(days=2),
        status=RegistrationStatus.ATTENDED
    )
    db.add(reg_3)
    db.flush()

    ticket_3 = Ticket(
        registration_id=reg_3.id,
        ticket_code=generate_ticket_code(),
        qr_token=generate_qr_token(),
        issued_at=reg_3.registered_at,
        used=True,
        used_at=completed_event.start_time + timedelta(minutes=10)
    )
    db.add(ticket_3)
    db.flush()

    attendance_3 = Attendance(
        event_id=completed_event.id,
        user_id=demo_student.id,
        ticket_id=ticket_3.id,
        checked_in_at=ticket_3.used_at,
        checked_in_by=created_club_users[0].id
    )
    db.add(attendance_3)

    # Feedback for completed event
    feedback_1 = Feedback(
        event_id=completed_event.id,
        user_id=demo_student.id,
        rating=5,
        comment="Incredible hands-on session by SDC MVJCE! The live coding and deployment walkthrough were very helpful.",
        submitted_at=completed_event.end_time + timedelta(hours=1)
    )
    db.add(feedback_1)

    # Live Poll for DevFest
    poll_1 = Poll(
        event_id=upcoming_published_1.id,
        question="What track are you planning to build for DevFest 2026?",
        status=PollStatus.ACTIVE,
        created_at=now - timedelta(hours=2)
    )
    db.add(poll_1)
    db.flush()

    poll_options = [
        PollOption(poll_id=poll_1.id, option_text="AI Agents & LLM Applications"),
        PollOption(poll_id=poll_1.id, option_text="Full-Stack Web & Mobile Apps"),
        PollOption(poll_id=poll_1.id, option_text="Cloud Infrastructure & DevOps"),
        PollOption(poll_id=poll_1.id, option_text="IoT & Embedded Hardware"),
    ]
    db.add_all(poll_options)
    db.flush()

    # Arjun votes on poll
    poll_resp = PollResponse(
        poll_id=poll_1.id,
        option_id=poll_options[0].id,
        user_id=demo_student.id,
        submitted_at=now - timedelta(minutes=45)
    )
    db.add(poll_resp)

    # System notifications
    notif_1 = Notification(
        user_id=demo_student.id,
        title="Registration Confirmed!",
        message=f"You are successfully registered for '{upcoming_published_1.title}'. Your digital ticket is ready.",
        type="REGISTRATION",
        is_read=False
    )
    notif_2 = Notification(
        user_id=created_club_users[0].id,
        title="Event Pending Approval",
        message="Your event 'Clean Code & Fast APIs Workshop' is under review by MVJCE IT Administration.",
        type="INFO",
        is_read=False
    )
    db.add_all([notif_1, notif_2])

    db.commit()
    db.close()

    print("\n" + "="*60)
    print("[SUCCESS] EvntPulse MVJCE Database Seeded Successfully!")
    print("="*60)
    print("Admin Email (Full Platform & Event Approval Control):")
    print("  it.admin@mvjce.edu.in              / Admin@123")
    print("\nClub Organizer Emails (Isolated to their respective club):")
    for c in club_meta:
        print(f"  {c['email']:34} / Club@123 ({c['name']})")
    print("\nStudent Account (Only 1 student configured):")
    print("  student@mvjce.edu.in               / Student@123 (Arjun Sharma)")
    print("="*60 + "\n")

def seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            print("[AUTO-SEED] Fresh database detected. Automatically seeding MVJCE ecosystem...")
            seed_database(drop_existing=False)
    except Exception as err:
        print(f"[AUTO-SEED] Error checking or seeding database: {err}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
