# Implementation Plan

## Phase 1: Data Model + CRUD
- Create relational entities and DB mappings for users, groups, permissions, family, person, districts, roles, and transactions.
- Implement baseline CRUD APIs for families and persons.
- Add soft-delete for persons.

## Phase 2: Auth + RBAC
- Add JWT login endpoint and stateless security filter.
- Resolve user authorities through group-permission model.
- Keep user creation admin-controlled.

## Phase 3: Family + Person Relationships
- Support `father`, `mother`, `spouse` links in `Person`.
- Keep one-family-per-person via required `family` reference.
- Add district + ward + tole fields at person level.

## Phase 4: Financial Rules
- Add deposit/withdraw transaction API.
- Enforce:
  - withdraw allowed only for president person
  - caller must also have `TX_WITHDRAW` permission

## Phase 5: Frontend Baseline
- Add React + Tailwind app structure.
- Implement login and guarded routes.
- Provide dashboard + management page shells ready for integration.

## Phase 6: Next Steps
- Full 77-district seeding
- Admin user/group/permission CRUD
- Advanced search (name EN/NP, district, family, phone)
- Audit logs, refresh tokens, pagination, tests
