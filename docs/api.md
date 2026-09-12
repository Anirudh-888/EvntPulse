# EvntPulse API Reference

The EvntPulse REST API adheres to standard HTTP status codes and JSON envelopes. Interactive Swagger documentation is served automatically at `/docs`.

Base Path: `/api/v1`

---

## Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new student or organizer | No |
| `POST` | `/auth/login` | Login and receive Bearer JWT | No |
| `GET` | `/auth/me` | Fetch profile of authenticated user | Yes |

---

## Events (`/api/v1/events`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/events` | List events with filters (`search`, `category`, `club_id`) | Optional |
| `GET` | `/events/{id}` | Detailed event information + registration status | Optional |
| `POST` | `/events` | Create new event (Draft/Published) | Organizer / Admin |
| `PUT` | `/events/{id}` | Update event parameters | Organizer / Admin |
| `DELETE` | `/events/{id}` | Delete event | Organizer / Admin |
| `POST` | `/events/{id}/publish` | Transition status to `PUBLISHED` | Organizer / Admin |
| `POST` | `/events/{id}/cancel` | Transition status to `CANCELLED` | Organizer / Admin |
| `POST` | `/events/{id}/complete` | Transition status to `COMPLETED` | Organizer / Admin |

---

## Registrations & Tickets

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/events/{id}/register` | Register student, check capacity, return ticket | Student |
| `DELETE` | `/events/{id}/register` | Cancel active registration | Student |
| `GET` | `/users/me/registrations` | Fetch student registration history & digital tickets | Student |
| `GET` | `/events/{id}/registrations` | List all attendees registered for event | Organizer / Admin |
| `GET` | `/tickets/{ticket_id}` | Fetch ticket details and base64 QR payload | Owner / Org / Admin |

---

## Attendance & Check-In

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/attendance/check-in` | Check in attendee by `qr_token` or `ticket_code` | Organizer / Admin |
| `GET` | `/events/{id}/attendance` | List checked-in attendees | Organizer / Admin |
| `GET` | `/events/{id}/attendance/stats`| Live stats: registered, checked-in, rate % | Public / Org |

---

## Engagement: Polls & Feedback

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/events/{id}/polls` | Get active/closed polls and options | Optional |
| `POST` | `/events/{id}/polls` | Create new interactive poll | Organizer / Admin |
| `POST` | `/polls/{id}/vote` | Submit vote (single response enforced) | Authenticated |
| `PUT` | `/polls/{id}/status` | Change poll status (`ACTIVE`/`CLOSED`) | Organizer / Admin |
| `POST` | `/events/{id}/feedback` | Submit rating (1-5) and review | Checked-in Attendee |
| `GET` | `/events/{id}/feedback/stats` | Rating averages and distribution | Public / Org |

---

## Analytics & Event Health

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/events/{id}/analytics` | Full intelligence report, Health Score & Insights | Public / Org |
| `GET` | `/analytics/platform` | Global campus statistics | Admin |
