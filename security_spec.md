# Security Specification - Chanting Feature

## 1. Data Invariants
- **Global Chants**: Publicly readable, writeable only by Admin.
- **User Chants**: Owned by the user. Only the owner can read/write their own chants.
- **Chant Sessions**: Owned by the user. Only the owner can create/read their own sessions. Sessions are immutable once created (no update/delete).
- **Identity Integrity**: `ownerId` or path `userId` must match `request.auth.uid`.
- **System Integrity**: `totalCount` in `UserChant` should ideally be updated in a transaction or atomically when a `ChantSession` is added (though for simplicity in Firestore Rules we just ensure the user can only update their own).

## 2. The "Dirty Dozen" Payloads

1. **Spoofed Owner**: Attempt to create a user chant with `userId` of another user.
2. **Unauthorized Read**: User A tries to read User B's chant collection.
3. **Ghost Update**: User A tries to update User B's chant count.
4. **Invalid Count**: Updating count to a negative number or a non-number.
5. **Admin Bypass**: User tries to write to the global `chants` collection.
6. **Session Forgery**: Creating a session with a future timestamp.
7. **Session Tampering**: Attempting to update an existing session log.
8. **Shadow Field**: Adding `isAdmin: true` to a user profile or document.
9. **Identity Poisoning**: Using a 2MB string as a chant ID.
10. **Resource Exhaustion**: Creating 10,000 sessions in one minute (Rate limiting - rules can't do this perfectly but we check sizes).
11. **PII Leak**: If we had email in chants, trying to read all chants to scrape emails.
12. **Cross-User Session**: Logging a session for a chant that belongs to another user.

## 3. Test Runner (Draft Logic)
Rules will enforce:
- `request.auth.uid == userId` for all `/users/{userId}/...` paths.
- `allow update: if incoming().totalCount >= existing().totalCount` (monotonic growth).
- `allow create: if incoming().timestamp == request.time`.
