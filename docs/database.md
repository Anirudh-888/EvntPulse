# EvntPulse Database Schema & Entity Relationships

The EvntPulse database schema is implemented with SQLAlchemy ORM and SQLite (seamlessly swappable for PostgreSQL in production).

## 1. Entity Relationship Overview

```
 [User] 1 ────────── N [Club] (owner_id)
   │
   ├─────── 1 ─────── N [Registration]
   │                         │
   │                         └── 1 ─── 1 [Ticket]
   │                                        │
   ├─────── 1 ─────── N [Attendance] <──────┘
   │                         │
   ├─────── 1 ─────── N [Feedback]
   │
   ├─────── 1 ─────── N [PollResponse]
   │
   └─────── 1 ─────── N [Notification]

 [Club] 1 ────────── N [Event]
                         │
                         ├────── 1 ────── N [Registration]
                         ├────── 1 ────── N [Attendance]
                         ├────── 1 ────── N [Feedback]
                         └────── 1 ────── N [Poll] 1 ─── N [PollOption] 1 ─── N [PollResponse]
```

---

## 2. Table Definitions & Constraints

### `users`
- `id`: `Integer`, Primary Key
- `name`: `String(100)`, Not Null
- `email`: `String(150)`, Unique, Indexed, Not Null
- `password_hash`: `String(255)`, Not Null
- `role`: `Enum(STUDENT, ORGANIZER, ADMIN)`, Indexed, Not Null
- `college`: `String(150)`
- `department`: `String(100)`
- `year`: `String(20)`
- `profile_image`: `String(500)`
- `created_at`, `updated_at`: `DateTime (UTC)`

### `clubs`
- `id`: `Integer`, Primary Key
- `name`: `String(100)`, Unique, Indexed, Not Null
- `description`: `Text`
- `logo_url`: `String(500)`
- `owner_id`: `Integer`, ForeignKey(`users.id`), Indexed, Not Null
- `created_at`, `updated_at`: `DateTime (UTC)`

### `events`
- `id`: `Integer`, Primary Key
- `club_id`: `Integer`, ForeignKey(`clubs.id`), Indexed, Not Null
- `title`: `String(200)`, Indexed, Not Null
- `description`: `Text`, Not Null
- `category`: `Enum(TECHNOLOGY, CULTURAL, SPORTS, WORKSHOP, HACKATHON, SEMINAR, COMPETITION, SOCIAL, OTHER)`, Indexed
- `venue`: `String(200)`, Not Null
- `start_time`: `DateTime (UTC)`, Indexed, Not Null
- `end_time`: `DateTime (UTC)`, Not Null
- `registration_deadline`: `DateTime (UTC)`, Not Null
- `capacity`: `Integer`, Not Null
- `poster_url`: `String(500)`
- `status`: `Enum(DRAFT, PUBLISHED, ONGOING, COMPLETED, CANCELLED)`, Indexed, Not Null

### `registrations`
- `id`: `Integer`, Primary Key
- `user_id`: `Integer`, ForeignKey(`users.id`), Indexed, Not Null
- `event_id`: `Integer`, ForeignKey(`events.id`), Indexed, Not Null
- `status`: `Enum(REGISTERED, CANCELLED, ATTENDED)`, Indexed
- `registered_at`: `DateTime (UTC)`, Not Null
- **Unique Constraint**: `(user_id, event_id)`

### `tickets`
- `id`: `Integer`, Primary Key
- `registration_id`: `Integer`, ForeignKey(`registrations.id`), Unique, Indexed
- `ticket_code`: `String(50)`, Unique, Indexed, Not Null (e.g., `EP-7X9K-42M1`)
- `qr_token`: `String(100)`, Unique, Indexed, Not Null (e.g., `ep_qr_aB91...`)
- `issued_at`: `DateTime (UTC)`, Not Null
- `used`: `Boolean`, Default `False`, Indexed
- `used_at`: `DateTime (UTC)`, Nullable

### `attendance`
- `id`: `Integer`, Primary Key
- `event_id`: `Integer`, ForeignKey(`events.id`), Indexed, Not Null
- `user_id`: `Integer`, ForeignKey(`users.id`), Indexed, Not Null
- `ticket_id`: `Integer`, ForeignKey(`tickets.id`), Unique, Indexed, Not Null
- `checked_in_at`: `DateTime (UTC)`, Not Null
- `checked_in_by`: `Integer`, ForeignKey(`users.id`), Nullable
- **Unique Constraint**: `(event_id, user_id)`

### `polls`, `poll_options`, `poll_responses`
- Enforces single response per user per poll via Unique Constraint `(poll_id, user_id)`.

### `feedbacks`
- `id`: `Integer`, Primary Key
- `event_id`: `Integer`, ForeignKey(`events.id`), Indexed
- `user_id`: `Integer`, ForeignKey(`users.id`), Indexed
- `rating`: `Integer` (1 to 5), Not Null
- `comment`: `Text`
- `submitted_at`: `DateTime (UTC)`, Not Null
- **Unique Constraint**: `(event_id, user_id)`
