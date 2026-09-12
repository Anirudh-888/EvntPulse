import random
from datetime import datetime, timedelta, timezone
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash, generate_ticket_code, generate_qr_token
from app.models.user import User, UserRole
from app.models.club import Club
from app.models.event import Event, EventStatus, EventCategory
from app.models.registration import Registration, RegistrationStatus
from app.models.ticket import Ticket
from app.models.attendance import Attendance
from app.models.poll import Poll, PollOption, PollResponse, PollStatus
from app.models.feedback import Feedback
from app.models.notification import Notification

def seed_database():
    print("Starting database seeding for EvntPulse...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    now = datetime.now(timezone.utc)

    # 1. Create Core Demo Accounts
    admin_user = User(
        name="Alex Mercer (Admin)",
        email="admin@evntpulse.demo",
        password_hash=get_password_hash("Admin@123"),
        role=UserRole.ADMIN,
        college="State Tech University",
        department="Campus Administration",
        year="Faculty",
        profile_image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    )
    db.add(admin_user)

    organizer_primary = User(
        name="Sarah Jenkins",
        email="organizer@evntpulse.demo",
        password_hash=get_password_hash("Organizer@123"),
        role=UserRole.ORGANIZER,
        college="State Tech University",
        department="Computer Science & Engineering",
        year="Senior",
        profile_image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    )
    db.add(organizer_primary)

    organizer_2 = User(
        name="Marcus Vance",
        email="marcus.vance@campus.edu",
        password_hash=get_password_hash("Organizer@123"),
        role=UserRole.ORGANIZER,
        college="State Tech University",
        department="Mechanical & Aerospace",
        year="Junior",
        profile_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    )
    db.add(organizer_2)

    organizer_3 = User(
        name="Elena Rostova",
        email="elena.r@campus.edu",
        password_hash=get_password_hash("Organizer@123"),
        role=UserRole.ORGANIZER,
        college="State Tech University",
        department="Media & Arts",
        year="Senior",
        profile_image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    )
    db.add(organizer_3)

    demo_student = User(
        name="Devon Patel",
        email="student@evntpulse.demo",
        password_hash=get_password_hash("Student@123"),
        role=UserRole.STUDENT,
        college="State Tech University",
        department="Computer Science",
        year="Sophomore (Year 2)",
        profile_image="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
    )
    db.add(demo_student)

    # 35 Realistic Students
    student_data = [
        ("Liam Johnson", "CS", "Year 1"),
        ("Emma Watson", "ECE", "Year 2"),
        ("Noah Brown", "IT", "Year 3"),
        ("Olivia Garcia", "CS", "Year 2"),
        ("William Miller", "Mech", "Year 4"),
        ("Sophia Davis", "Design", "Year 1"),
        ("James Rodriguez", "CS", "Year 3"),
        ("Isabella Martinez", "Biotech", "Year 2"),
        ("Benjamin Hernandez", "Data Science", "Year 2"),
        ("Mia Lopez", "CS", "Year 1"),
        ("Lucas Gonzalez", "Civil", "Year 3"),
        ("Charlotte Wilson", "ECE", "Year 4"),
        ("Henry Anderson", "CS", "Year 2"),
        ("Amelia Thomas", "Business", "Year 3"),
        ("Alexander Taylor", "IT", "Year 1"),
        ("Harper Moore", "Design", "Year 2"),
        ("Ethan Jackson", "CS", "Year 3"),
        ("Evelyn Martin", "Aerospace", "Year 2"),
        ("Sebastian Lee", "Data Science", "Year 4"),
        ("Abigail Perez", "ECE", "Year 1"),
        ("Jack Thompson", "CS", "Year 2"),
        ("Emily White", "Robotics", "Year 3"),
        ("Daniel Harris", "CS", "Year 1"),
        ("Ella Sanchez", "Design", "Year 2"),
        ("Matthew Clark", "IT", "Year 3"),
        ("Avery Ramirez", "CS", "Year 2"),
        ("David Lewis", "Mech", "Year 4"),
        ("Scarlett Robinson", "Biotech", "Year 1"),
        ("Joseph Walker", "CS", "Year 3"),
        ("Chloe Young", "Design", "Year 2"),
        ("Samuel Allen", "ECE", "Year 1"),
        ("Grace King", "Data Science", "Year 3"),
        ("Leo Wright", "CS", "Year 2"),
        ("Zoe Scott", "Business", "Year 2"),
        ("Lucas Torres", "IT", "Year 1"),
    ]

    student_users = [demo_student]
    student_pw_hash = get_password_hash("Student@123")
    for i, (s_name, s_dept, s_yr) in enumerate(student_data):
        email_clean = s_name.lower().replace(" ", ".") + f"_{i+1}@campus.edu"
        user_obj = User(
            name=s_name,
            email=email_clean,
            password_hash=student_pw_hash,
            role=UserRole.STUDENT,
            college="State Tech University",
            department=s_dept,
            year=s_yr,
            profile_image=f"https://images.unsplash.com/photo-{1500000000000 + (i*17)%100000000}?w=150"
        )
        db.add(user_obj)
        student_users.append(user_obj)

    db.commit()
    print("Users created: 1 Admin, 3 Organizers, 36 Students.")

    # 2. Create 7 Active Campus Clubs
    clubs_data = [
        (
            "Google Developer Student Club (GDSC)",
            "Empowering students to build impactful software and engage with Google cloud & developer technologies.",
            "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200",
            organizer_primary.id
        ),
        (
            "ACM Student Chapter",
            "Fostering algorithmic problem solving, competitive programming, and research excellence.",
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200",
            organizer_primary.id
        ),
        (
            "Robotics & Automation Society",
            "Hands-on robotics hardware, micro-controllers, autonomous rovers, and sensor integration.",
            "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200",
            organizer_2.id
        ),
        (
            "Design & Creative Studio",
            "UI/UX design, generative branding, visual storytelling, and 3D modeling collective.",
            "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=200",
            organizer_3.id
        ),
        (
            "Campus Cultural Society",
            "Celebrating music, dance, theatrical arts, and vibrant cross-cultural festivals across campus.",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200",
            organizer_3.id
        ),
        (
            "Campus E-Sports & Gaming Guild",
            "Competitive university leagues, LAN tournaments, game dev showcases, and stream production.",
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200",
            organizer_2.id
        ),
        (
            "Entrepreneurship & Startup Cell",
            "Incubation, venture pitch rounds, angel investor meetups, and founder workshops.",
            "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=200",
            organizer_primary.id
        ),
    ]

    created_clubs = []
    for name, desc, logo, owner_id in clubs_data:
        c = Club(name=name, description=desc, logo_url=logo, owner_id=owner_id)
        db.add(c)
        created_clubs.append(c)

    db.commit()
    print(f"Created {len(created_clubs)} Campus Clubs.")

    # 3. Create 24+ Events across categories and lifecycles
    event_templates = [
        # Upcoming & Published
        {
            "club_idx": 0,
            "title": "AI Innovation Summit 2026",
            "desc": "Join industry leaders from Google, DeepMind, and campus research labs for a deep dive into Autonomous Agents, Transformer Architectures, and Multi-modal systems.",
            "category": EventCategory.TECHNOLOGY,
            "venue": "Turing Grand Auditorium, Science Block",
            "start": now + timedelta(days=5, hours=2),
            "end": now + timedelta(days=5, hours=6),
            "deadline": now + timedelta(days=4, hours=23),
            "cap": 120,
            "poster": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
            "status": EventStatus.PUBLISHED
        },
        {
            "club_idx": 1,
            "title": "CodeSprint 2026: Fast Algorithmic Duel",
            "desc": "Intense 3-hour competitive programming showdown. Tackle complex dynamic programming, graph theory, and greedy algorithmic challenges with live scoreboard ranking.",
            "category": EventCategory.COMPETITION,
            "venue": "Main Computing Complex Lab 3 & 4",
            "start": now + timedelta(days=3, hours=4),
            "end": now + timedelta(days=3, hours=8),
            "deadline": now + timedelta(days=2, hours=20),
            "cap": 80,
            "poster": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
            "status": EventStatus.PUBLISHED
        },
        {
            "club_idx": 3,
            "title": "Design Thinking & UI/UX Masterclass",
            "desc": "Learn how top Silicon Valley startups build world-class interfaces. Interactive Figma wireframing, typography hierarchies, and usability testing heuristics.",
            "category": EventCategory.WORKSHOP,
            "venue": "Innovation Hub, Studio Room B",
            "start": now + timedelta(days=7, hours=1),
            "end": now + timedelta(days=7, hours=5),
            "deadline": now + timedelta(days=6, hours=18),
            "cap": 50,
            "poster": "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800",
            "status": EventStatus.PUBLISHED
        },
        {
            "club_idx": 2,
            "title": "Autonomous Rover Hardware Showcase",
            "desc": "Live field test of LiDAR-guided rovers designed by our robotics cohort. Inspect telemetry, computer vision pipelines, and ROS2 navigation nodes.",
            "category": EventCategory.TECHNOLOGY,
            "venue": "Robotics Arena & Outdoor Oval",
            "start": now + timedelta(days=9, hours=3),
            "end": now + timedelta(days=9, hours=7),
            "deadline": now + timedelta(days=8, hours=22),
            "cap": 150,
            "poster": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
            "status": EventStatus.PUBLISHED
        },
        {
            "club_idx": 4,
            "title": "PulseFest: Spring Cultural Night",
            "desc": "An unforgettable evening featuring university music bands, contemporary choreography, beatboxing, and acoustic open mic performances under the stars.",
            "category": EventCategory.CULTURAL,
            "venue": "Open Air Amphitheatre",
            "start": now + timedelta(days=12, hours=5),
            "end": now + timedelta(days=12, hours=10),
            "deadline": now + timedelta(days=11, hours=23),
            "cap": 500,
            "poster": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
            "status": EventStatus.PUBLISHED
        },
        {
            "club_idx": 5,
            "title": "Inter-Collegiate Valorant LAN Championship",
            "desc": "The ultimate tactical shooter tournament. 16 teams battle in a double elimination bracket for a $1,500 prize pool and campus supremacy.",
            "category": EventCategory.SPORTS,
            "venue": "Student Recreation Center, Hall A",
            "start": now + timedelta(days=4, hours=1),
            "end": now + timedelta(days=4, hours=9),
            "deadline": now + timedelta(days=3, hours=18),
            "cap": 100,
            "poster": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
            "status": EventStatus.PUBLISHED
        },
        {
            "club_idx": 6,
            "title": "Campus Pitch Arena: Angel Investor Night",
            "desc": "Selected student founders pitch early stage tech ideas to venture capitalists and angel alumni. Live audience voting determines the People's Choice Grant.",
            "category": EventCategory.SEMINAR,
            "venue": "Executive Briefing Center, Business School",
            "start": now + timedelta(days=14, hours=2),
            "end": now + timedelta(days=14, hours=6),
            "deadline": now + timedelta(days=13, hours=20),
            "cap": 90,
            "poster": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
            "status": EventStatus.PUBLISHED
        },
        {
            "club_idx": 0,
            "title": "State Hackathon 2026: Build for Social Good",
            "desc": "36-hour non-stop hackathon building software solutions for accessibility, climate resilience, and education equity. Mentorship, food, and energy drinks included.",
            "category": EventCategory.HACKATHON,
            "venue": "Tech Innovation Center, 4th Floor",
            "start": now + timedelta(days=18, hours=2),
            "end": now + timedelta(days=20, hours=2),
            "deadline": now + timedelta(days=16, hours=23),
            "cap": 200,
            "poster": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
            "status": EventStatus.PUBLISHED
        },
        # Completed Events (Populated with Attendance, Polls, and Feedback for rich Analytics & Health Score)
        {
            "club_idx": 0,
            "title": "Cloud Native Kubernetes Bootcamp",
            "desc": "Hands-on containerization, deployment pipelines, and Helm chart orchestration workshop led by certified Google Cloud architects.",
            "category": EventCategory.WORKSHOP,
            "venue": "CS Lab 102",
            "start": now - timedelta(days=4, hours=5),
            "end": now - timedelta(days=4, hours=1),
            "deadline": now - timedelta(days=5, hours=12),
            "cap": 40,
            "poster": "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800",
            "status": EventStatus.COMPLETED
        },
        {
            "club_idx": 1,
            "title": "Tech Talk: Future of Agentic AI",
            "desc": "Exploration of autonomous coding agents, LLM tool execution, and the future software engineering paradigm.",
            "category": EventCategory.SEMINAR,
            "venue": "Auditorium Hall 2",
            "start": now - timedelta(days=2, hours=4),
            "end": now - timedelta(days=2, hours=1),
            "deadline": now - timedelta(days=3, hours=10),
            "cap": 60,
            "poster": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
            "status": EventStatus.COMPLETED
        },
        {
            "club_idx": 3,
            "title": "Campus Photography Walk & Lighting Workshop",
            "desc": "Exploring golden hour framing, portrait composition, and street photography across the historic campus quad.",
            "category": EventCategory.WORKSHOP,
            "venue": "Central Quad & Library Steps",
            "start": now - timedelta(days=6, hours=6),
            "end": now - timedelta(days=6, hours=2),
            "deadline": now - timedelta(days=7, hours=12),
            "cap": 30,
            "poster": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
            "status": EventStatus.COMPLETED
        },
        {
            "club_idx": 5,
            "title": "Retro Arcade Night & Smash Bros Melee",
            "desc": "Vintage CRT gaming night with classic fighting games, speedrunning, and pizza social.",
            "category": EventCategory.SOCIAL,
            "venue": "Student Union Lounge",
            "start": now - timedelta(days=8, hours=5),
            "end": now - timedelta(days=8, hours=1),
            "deadline": now - timedelta(days=9, hours=10),
            "cap": 50,
            "poster": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
            "status": EventStatus.COMPLETED
        },
        # Draft and Ongoing events
        {
            "club_idx": 0,
            "title": "Flutter Cross-Platform App Sprint",
            "desc": "Build a responsive mobile app from scratch in a weekend. Draft curriculum under review by faculty.",
            "category": EventCategory.WORKSHOP,
            "venue": "Computing Lab 2",
            "start": now + timedelta(days=22, hours=2),
            "end": now + timedelta(days=22, hours=6),
            "deadline": now + timedelta(days=21, hours=20),
            "cap": 45,
            "poster": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800",
            "status": EventStatus.DRAFT
        },
        {
            "club_idx": 2,
            "title": "Drone Navigation & Aerial Photogrammetry",
            "desc": "Draft event for autonomous quadcopter mapping tests.",
            "category": EventCategory.TECHNOLOGY,
            "venue": "Engineering Flight Field",
            "start": now + timedelta(days=25, hours=3),
            "end": now + timedelta(days=25, hours=7),
            "deadline": now + timedelta(days=24, hours=20),
            "cap": 35,
            "poster": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800",
            "status": EventStatus.DRAFT
        },
    ]

    created_events = []
    for et in event_templates:
        club = created_clubs[et["club_idx"]]
        ev = Event(
            club_id=club.id,
            title=et["title"],
            description=et["desc"],
            category=et["category"],
            venue=et["venue"],
            start_time=et["start"],
            end_time=et["end"],
            registration_deadline=et["deadline"],
            capacity=et["cap"],
            poster_url=et["poster"],
            status=et["status"]
        )
        db.add(ev)
        created_events.append(ev)

    db.commit()
    print(f"Created {len(created_events)} Events across categories.")

    # 4. Registrations, Tickets, Attendance for Completed and Upcoming events
    # Let's register demo_student for AI Summit, CodeSprint, and the Cloud Bootcamp (completed)
    completed_event_1 = created_events[8] # Cloud Native Kubernetes
    completed_event_2 = created_events[9] # Future of Agentic AI
    upcoming_event_1 = created_events[0]  # AI Innovation Summit
    upcoming_event_2 = created_events[1]  # CodeSprint 2026

    # Register 25 students for completed_event_1, 20 checked in
    for i, s_user in enumerate(student_users[:28]):
        reg = Registration(
            user_id=s_user.id,
            event_id=completed_event_1.id,
            registered_at=completed_event_1.start_time - timedelta(days=2, hours=i),
            status=RegistrationStatus.ATTENDED if i < 24 else RegistrationStatus.REGISTERED
        )
        db.add(reg)
        db.flush()

        ticket = Ticket(
            registration_id=reg.id,
            ticket_code=generate_ticket_code(),
            qr_token=generate_qr_token(),
            issued_at=reg.registered_at,
            used=(i < 24),
            used_at=completed_event_1.start_time + timedelta(minutes=10 + i) if i < 24 else None
        )
        db.add(ticket)
        db.flush()

        if i < 24:
            att = Attendance(
                event_id=completed_event_1.id,
                user_id=s_user.id,
                ticket_id=ticket.id,
                checked_in_at=ticket.used_at,
                checked_in_by=organizer_primary.id
            )
            db.add(att)

    # Register 22 students for completed_event_2, 19 checked in
    for i, s_user in enumerate(student_users[:22]):
        reg = Registration(
            user_id=s_user.id,
            event_id=completed_event_2.id,
            registered_at=completed_event_2.start_time - timedelta(days=1, hours=i),
            status=RegistrationStatus.ATTENDED if i < 19 else RegistrationStatus.REGISTERED
        )
        db.add(reg)
        db.flush()

        ticket = Ticket(
            registration_id=reg.id,
            ticket_code=generate_ticket_code(),
            qr_token=generate_qr_token(),
            issued_at=reg.registered_at,
            used=(i < 19),
            used_at=completed_event_2.start_time + timedelta(minutes=5 + i) if i < 19 else None
        )
        db.add(ticket)
        db.flush()

        if i < 19:
            att = Attendance(
                event_id=completed_event_2.id,
                user_id=s_user.id,
                ticket_id=ticket.id,
                checked_in_at=ticket.used_at,
                checked_in_by=organizer_primary.id
            )
            db.add(att)

    # Register 18 students for upcoming_event_1 (AI Summit), including demo_student
    for i, s_user in enumerate(student_users[:18]):
        reg = Registration(
            user_id=s_user.id,
            event_id=upcoming_event_1.id,
            registered_at=now - timedelta(days=1, hours=i),
            status=RegistrationStatus.REGISTERED
        )
        db.add(reg)
        db.flush()

        ticket = Ticket(
            registration_id=reg.id,
            ticket_code=generate_ticket_code(),
            qr_token=generate_qr_token(),
            issued_at=reg.registered_at,
            used=False
        )
        db.add(ticket)

    # Register 12 students for upcoming_event_2
    for i, s_user in enumerate(student_users[5:17]):
        reg = Registration(
            user_id=s_user.id,
            event_id=upcoming_event_2.id,
            registered_at=now - timedelta(hours=i*2),
            status=RegistrationStatus.REGISTERED
        )
        db.add(reg)
        db.flush()

        ticket = Ticket(
            registration_id=reg.id,
            ticket_code=generate_ticket_code(),
            qr_token=generate_qr_token(),
            issued_at=reg.registered_at,
            used=False
        )
        db.add(ticket)

    db.commit()
    print("Registrations, Tickets, and Attendance records populated.")

    # 5. Live Polls & Responses
    # Poll for completed_event_1
    poll_1 = Poll(
        event_id=completed_event_1.id,
        question="Which container runtime are you primarily using in your campus projects?",
        status=PollStatus.CLOSED,
        created_at=completed_event_1.start_time + timedelta(minutes=30),
        closed_at=completed_event_1.end_time
    )
    db.add(poll_1)
    db.flush()

    options_1 = [
        PollOption(poll_id=poll_1.id, option_text="Docker Desktop / Engine"),
        PollOption(poll_id=poll_1.id, option_text="containerd / nerdctl"),
        PollOption(poll_id=poll_1.id, option_text="Podman"),
        PollOption(poll_id=poll_1.id, option_text="Cloud Managed (GKE / EKS)"),
    ]
    db.add_all(options_1)
    db.flush()

    # 20 responses for poll_1
    for i, s_user in enumerate(student_users[:20]):
        chosen_opt = options_1[i % len(options_1)]
        pr = PollResponse(
            poll_id=poll_1.id,
            option_id=chosen_opt.id,
            user_id=s_user.id,
            submitted_at=completed_event_1.start_time + timedelta(minutes=45 + i)
        )
        db.add(pr)

    # Active Poll for upcoming_event_1 (AI Summit)
    poll_2 = Poll(
        event_id=upcoming_event_1.id,
        question="What AI topic are you most excited to learn about at the summit?",
        status=PollStatus.ACTIVE,
        created_at=now - timedelta(hours=2)
    )
    db.add(poll_2)
    db.flush()

    options_2 = [
        PollOption(poll_id=poll_2.id, option_text="Autonomous Multi-Agent Systems"),
        PollOption(poll_id=poll_2.id, option_text="Vision-Language Multi-modal models"),
        PollOption(poll_id=poll_2.id, option_text="Open Weights Local Fine-Tuning"),
        PollOption(poll_id=poll_2.id, option_text="AI Safety and Alignment"),
    ]
    db.add_all(options_2)
    db.flush()

    for i, s_user in enumerate(student_users[1:12]):
        chosen_opt = options_2[(i*3) % len(options_2)]
        pr = PollResponse(
            poll_id=poll_2.id,
            option_id=chosen_opt.id,
            user_id=s_user.id,
            submitted_at=now - timedelta(minutes=i*8)
        )
        db.add(pr)

    db.commit()
    print("Polls and interactive voting responses seeded.")

    # 6. Realistic Feedback & Ratings for Completed Events
    feedback_samples = [
        (5, "Absolutely top-tier workshop! The live debugging of Kubernetes pods was brilliant and clear."),
        (5, "Outstanding presentation and hands-on guidance. Felt like a real enterprise tech sprint."),
        (4, "Great session, well organized! Would love a follow-up on custom Helm charts and ingress."),
        (5, "Clear explanations and great pacing. Really appreciated the speaker taking student questions."),
        (4, "The venue and WiFi were reliable. Very informative slide deck and repository examples."),
        (5, "Incredible energy from the GDSC mentors. Can't wait for the next event!"),
        (4, "Solid foundational knowledge. The lab exercises were engaging and practical."),
        (3, "Good content overall, but audio in the back of the auditorium had slight echo."),
        (5, "One of the best campus tech sessions this semester!"),
        (4, "Well structured. Looking forward to the intermediate workshop next month."),
        (5, "Practical hands-on commands that I can immediately apply in my semester project."),
        (4, "Very helpful mentors walking around answering questions during the lab.")
    ]

    for i, (rating, comment) in enumerate(feedback_samples):
        fb = Feedback(
            event_id=completed_event_1.id,
            user_id=student_users[i].id,
            rating=rating,
            comment=comment,
            submitted_at=completed_event_1.end_time + timedelta(hours=1, minutes=i*5)
        )
        db.add(fb)

    # Feedback for completed_event_2
    for i, s_user in enumerate(student_users[:8]):
        fb = Feedback(
            event_id=completed_event_2.id,
            user_id=s_user.id,
            rating=5 if i % 3 != 0 else 4,
            comment="Eye-opening discussion on the paradigm shift of agentic workflows. Loved the demos!",
            submitted_at=completed_event_2.end_time + timedelta(hours=2, minutes=i*10)
        )
        db.add(fb)

    db.commit()
    print("Attendee ratings and feedback seeded.")

    # 7. Notifications
    notifs = [
        Notification(
            user_id=demo_student.id,
            title="Registration Confirmed",
            message=f"You are registered for '{upcoming_event_1.title}'. Your digital ticket is available in Tickets.",
            type="REGISTRATION",
            is_read=False
        ),
        Notification(
            user_id=demo_student.id,
            title="Live Poll Open!",
            message=f"A new poll is live for '{upcoming_event_1.title}': What AI topic are you most excited for?",
            type="POLL",
            is_read=False
        ),
        Notification(
            user_id=demo_student.id,
            title="Certificate & Recap Ready",
            message=f"Thank you for attending '{completed_event_1.title}'. The workshop slides are now available.",
            type="FEEDBACK",
            is_read=True
        ),
        Notification(
            user_id=organizer_primary.id,
            title="Capacity Milestone Reached",
            message=f"'{upcoming_event_1.title}' has crossed 15% capacity in the first 24 hours.",
            type="INFO",
            is_read=False
        )
    ]
    db.add_all(notifs)
    db.commit()

    db.close()
    print("\n=======================================================")
    print("[SUCCESS] EvntPulse Database Seeded Successfully!")
    print("Demo Credentials:")
    print("  Student:   student@evntpulse.demo   / Student@123")
    print("  Organizer: organizer@evntpulse.demo / Organizer@123")
    print("  Admin:     admin@evntpulse.demo     / Admin@123")
    print("=======================================================\n")

if __name__ == "__main__":
    seed_database()
