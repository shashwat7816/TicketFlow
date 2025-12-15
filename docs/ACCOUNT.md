# Account Page

The frontend includes an `/account` page (protected) that shows:
- Account summary (name/email, order and reservation counts)
- Your Orders (list)
- Your Reservations (list with expiration)
- Your Season Passes (if any)

Endpoints used:
- GET /api/account
- GET /api/account/orders
- GET /api/account/reservations
- GET /api/account/season-passes

Note: The page expects the user to be authenticated (redirects to `/login` otherwise). The `AuthProvider` manages access tokens and refresh cookies.
