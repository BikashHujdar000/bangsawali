# Bangsawali - Family Tree & Community Management System

Monorepo starter for a bilingual (English + Nepali) family tree and community management platform.

## Implemented Foundation

### Backend (Spring Boot)
- JWT authentication (`/api/auth/login`)
- Admin-controlled user model (`AppUser`, `AppGroup`, `Permission`)
- Core domain entities:
  - `Family`
  - `Person` (with self-referencing relations: father/mother/spouse)
  - `District`
  - `PersonRole`, `PersonRoleMap`
  - `FinancialTransaction`
- Business rules included in service layer:
  - One person belongs to one family
  - One president per district
  - Withdraw requires:
    - person has PRESIDENT role
    - logged-in user has `TX_WITHDRAW` authority
- Basic dashboard aggregate endpoint
- Soft-delete support for person records

### Frontend (React + Tailwind starter)
- Login page
- Dashboard placeholder
- Family, Person, Transaction, User Management page shells
- Axios API client with JWT interceptor

## Project Structure

- `backend/` Spring Boot app
- `frontend/` React app

## Reset local database (wipe all data)

This drops and recreates the `bangsawali` database (see `application.yml` for default user/name). All families, persons, and transactions are removed. Hibernate recreates tables on next backend start; `DataSeeder` refills provinces/districts and default `admin` / `superadmin` users.

```bash
export PGPASSWORD='your-postgres-password'
./scripts/reset-local-postgres.sh
```

Then start the backend again (`cd backend && mvn spring-boot:run`).

## Run Backend

1. Ensure PostgreSQL is running.
2. Create database (example): `bangsawali`
3. Update credentials in `backend/src/main/resources/application.yml`
4. Start:
   - `cd backend`
   - `./mvnw spring-boot:run` (or `mvn spring-boot:run`)

## Run Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev` 

## Phase Mapping

- **Phase 1**: DB setup + entities + CRUD skeleton (implemented)
- **Phase 2**: JWT auth + RBAC wiring (implemented baseline)
- **Phase 3**: Family/Person logic (implemented baseline with relationship fields)
- **Phase 4**: Financial rules (implemented baseline)
- **Phase 5**: Frontend pages and API plumbing (implemented baseline)
- **Phase 6**: Advanced search/optimization (next)
