# ClinicBook - Doctor Appointment Booking System

A full stack project: patients find doctors and book free time slots, doctors manage their schedule, and an admin manages doctors and sees clinic stats.

**Backend:** Java 17, Spring Boot 3.2, Spring Security + JWT, Spring Data JPA (Hibernate), H2 or MySQL, Swagger UI
**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Router, Axios

## Features
- Three roles: **Patient**, **Doctor**, **Admin** (role-based access with JWT)
- Browse and search doctors, filter by specialty
- Slots are generated from each doctor's working hours; booked and past slots are disabled
- **Double booking is prevented** (doctor row is locked inside a transaction)
- Patients: book, view and cancel appointments
- Doctors: see their schedule, mark visits completed, cancel
- Admin: add doctors, hide or show doctors, see stats and all bookings
- Responsive layout, animated slot picker, page and list animations (respects "reduce motion")
- Global exception handling, input validation, BCrypt password hashing, Swagger docs, JUnit tests

## Project structure
```
clinicbook/
  backend/   Spring Boot API (controller -> service -> repository, DTOs, security, config)
  frontend/  React app (pages, components, context, api client)
```

## Run it

### 1. Backend (needs JDK 17+ and Maven)
```bash
cd backend
mvn spring-boot:run
```
API: http://localhost:8080   Swagger UI: http://localhost:8080/swagger-ui.html

The default database is a local **H2 file database**, so nothing else needs to be installed.
Demo data is created automatically on the first start.

**To use MySQL instead:** start MySQL, then
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
# optional: set DB_USER and DB_PASSWORD environment variables (defaults: root / root)
```

### 2. Frontend (needs Node 18+)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. In development, `/api` calls are proxied to port 8080.

## Demo accounts
| Role    | Email                          | Password    |
|---------|--------------------------------|-------------|
| Patient | patient@clinicbook.in          | Patient@123 |
| Doctor  | ananya.sharma@clinicbook.in    | Doctor@123  |
| Admin   | admin@clinicbook.in            | Admin@123   |

(The login page has buttons that fill these in.) All other seeded doctors use `Doctor@123`.

## API overview
| Method | Endpoint | Who |
|--------|----------|-----|
| POST | /api/auth/register, /api/auth/login | Public |
| GET  | /api/auth/me | Logged in |
| GET  | /api/doctors, /api/doctors/{id}, /api/doctors/{id}/slots?date=YYYY-MM-DD | Public |
| POST | /api/appointments | Patient |
| GET  | /api/appointments/my | Logged in |
| PATCH| /api/appointments/{id}/cancel | Owner patient, that doctor, or admin |
| GET  | /api/doctor/appointments | Doctor |
| PATCH| /api/doctor/appointments/{id}/complete | Doctor |
| GET  | /api/admin/stats, /api/admin/appointments, /api/admin/doctors | Admin |
| POST | /api/admin/doctors | Admin |
| PATCH| /api/admin/doctors/{id}/active?value=true/false | Admin |

Run the tests: `cd backend && mvn test`

## Things to be ready to explain in interviews
1. **How double booking is prevented.** `AppointmentService.book` runs in a `@Transactional` method and loads the doctor with `PESSIMISTIC_WRITE` (SELECT ... FOR UPDATE). Two simultaneous requests for the same doctor run one after the other, so the second sees the slot taken and gets HTTP 409. Cancelled appointments free the slot again.
2. **JWT flow.** Login returns a signed token (role inside). `JwtAuthFilter` reads the `Authorization: Bearer` header and sets the user in the security context. `SecurityConfig` maps URL patterns to roles.
3. **Why DTOs.** Entities (and password hashes) never leave the server; `Mapper` converts them to response records.
4. **Slots are computed, not stored.** From working hours and slot length, minus existing non-cancelled bookings. Simpler data model, no slot clean-up jobs.
5. **Validation and errors.** Bean Validation on request records; `GlobalExceptionHandler` returns one JSON shape for all errors.
6. **Ideas to extend:** email confirmation (JavaMailSender), Razorpay test payments, reminder scheduler (`@Scheduled`), doctor leave days, pagination, Dockerfile.

## Deploying (free tiers)
- Backend: Render or Railway. Set `JWT_SECRET` (32+ characters), `CORS_ORIGINS` (your frontend URL), and use the `mysql` profile with a hosted MySQL, or keep H2 for a demo (data resets on redeploy).
- Frontend: Vercel or Netlify. Set `VITE_API_URL` to your backend URL, build command `npm run build`, output folder `dist`.

## Troubleshooting
- **Port 8080 busy:** change `server.port` in `application.properties` and the proxy target in `frontend/vite.config.js`.
- **Blank doctor list:** the backend is not running, or the frontend is not on port 5173 / 3000 (add its URL to `CORS_ORIGINS`).
- **Want a fresh database:** stop the backend and delete `backend/data/`.
