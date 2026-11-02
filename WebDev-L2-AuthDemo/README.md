# Fieldnote Account Demo

A front-end-only registration, login, and protected dashboard demonstration using HTML, CSS, and the Web Crypto API. It stores a random per-user salt and SHA-256 password hash in this browser's `localStorage`; the active session is kept in `sessionStorage` and cleared on logout.

## Run locally

Open a terminal in this folder and run `python -m http.server 8000`. Visit `http://localhost:8000/register.html`. The Web Crypto API requires a secure context such as `localhost` or HTTPS, so opening these pages as `file://` may not work.

## Important limitation

This is an educational client-side demo, not production authentication. Users can inspect or alter browser storage, SHA-256 is not a password-specific hashing function, and there is no server-side authorization. Never use a real or reused password here. A real service should authenticate on a server, use a dedicated password hashing method such as Argon2id or bcrypt with appropriate parameters, and enforce authorization on the server.
