# EvntPulse Core User Flows & Critical Demonstration

## 1. Student Journey

```
Discover Event (Home / Events Discovery)
   │
   ▼
Inspect Event Details (Speakers, Venue, Available Seats)
   │
   ▼
Click "Register Now"
   │  ├── Validates Deadline & Capacity
   │  └── Generates Digital Ticket & Cryptographic QR Token
   ▼
View My Tickets (/student/tickets)
   │  └── Displays Ticket Passcard with QR Code and Manual Ticket ID
   ▼
Attend Event & Present QR at Venue Entrance
   │
   ▼
Organizer Scans QR -> Instant Verification
   │
   ▼
Participate in Live Polls during Session
   │
   ▼
Submit Post-Attendance Rating (1-5 Stars) & Comments
   │
   ▼
View Attendance & Participation History (/student/history)
```

---

## 2. Organizer Lifecycle

```
Create Club Event (/organizer/events/create)
   │  └── Define Venue, Dates, Deadlines, Capacity
   ▼
Publish Event -> Appears on Student Feed
   │
   ▼
Monitor Registrations & Capacity Fill
   │
   ▼
Day of Event: Launch QR Attendance Scanner (/organizer/events/:id -> Attendance)
   │  ├── Real-time Camera Feed (Html5Qrcode)
   │  ├── Fallback Manual Ticket Code Input (EP-XXXX-XXXX)
   │  └── Instant Feedback: SUCCESS / ALREADY_CHECKED_IN / INVALID_TICKET
   ▼
Launch Interactive Live Poll during Event
   │  └── Watch Votes Update in Real-Time
   ▼
Close Poll & Mark Event Completed
   │
   ▼
Review Event Health Intelligence (/organizer/events/:id -> Analytics)
   │  ├── Health Score (0-100) & Component Breakdown
   │  ├── Rule-Based Insights
   │  └── Attendee Feedback Distribution
```

---

## 3. End-to-End Critical Demonstration Flow

To reproduce the acceptance test:
1. **Login as Student** (`student@evntpulse.demo` / `Student@123`).
2. Go to **Events** (`/events`), click on **"AI Innovation Summit 2026"**.
3. Click **"Register Now"** -> Receive registration confirmation and QR ticket.
4. Visit **Tickets** (`/student/tickets`) to view your QR ticket and code (e.g. `EP-ABCD-1234`).
5. Open an incognito tab (or log out) and **Login as Organizer** (`organizer@evntpulse.demo` / `Organizer@123`).
6. Go to **My Events** -> click "Manage" on **"AI Innovation Summit 2026"**.
7. Switch to the **Attendance** tab. Enter the student's ticket code or point camera to the QR code.
8. Click **Verify & Check-In**:
   - Status changes to **SUCCESS**.
   - Check-in attendee counter increments immediately.
   - Re-entering the same ticket returns **"Ticket already checked in."**
9. Go to the **Live Polls** tab. Create a new poll or observe votes.
10. Switch back to student, cast a vote in the poll and submit a 5-star feedback review.
11. In the organizer portal, open the **Analytics & Intelligence** tab:
    - View updated turnout, attendance rate, poll participation, feedback breakdown.
    - Inspect the **Event Health Score (0–100)** with transparent weighting (30% attendance, 25% engagement, 25% rating, 20% feedback) and dynamic rule-based insights.
