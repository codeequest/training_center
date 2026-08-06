# CLAUDE.md

## Security: private-data access control

This app has **no Next.js Server Actions and no Next.js API routes** — the frontend
(`frontend/src`) is a client that calls a separate Express backend (`backend/src`) over
`fetch`. The security boundary is therefore the Express layer, not anything in
`frontend/src`. Do not add auth logic to `frontend/src/middleware.ts` (locale redirect
only) or treat client-side role checks (e.g. `admin/layout.tsx`) as security — they're
UX only, easily bypassed, and must never be the only gate.

Rules for `backend/src`:

1. Every route in `backend/src/routes/index.ts` that touches private data **must**
   explicitly carry `requireAuth` or `requireRole(...)` from
   `backend/src/middleware/auth.ts` — either directly on the route, or via
   `router.use(requireRole(...))` on the sub-router it's mounted on (as the `admin`
   sub-router does). Never add a route that relies on some other route's check.
2. If a handler serves or mutates a resource scoped to a specific user (not just a
   role), the controller **must** also verify ownership inside the function body —
   role/auth middleware alone stops unauthenticated access, not one user reading or
   modifying another user's data (IDOR). See `materials.controller.ts`
   (`listSessionMaterials`, `deleteMaterial`) and `enrollments.controller.ts`
   (`downloadCertificate`) for the pattern: fetch the resource, then check
   `resource.ownerId === req.user!.sub` (or teacher/admin equivalent) before acting.
3. When writing or reviewing any new backend route or controller, verify both (1) and
   (2) explicitly — don't assume a resource is protected because a similar one nearby
   is.
