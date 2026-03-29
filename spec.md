# Arabic Scholar Translator

## Current State
App has a working admin panel with Users, Ratings, Activity, and Videos tabs. Backend has methods for saving/retrieving users, ratings, activities, video records. No delete user or block user functionality exists.

## Requested Changes (Diff)

### Add
- Backend: `blockUser(email)`, `unblockUser(email)`, `isBlocked(email)`, `getAllBlockedUsers()` methods
- Backend: `deleteUser(userId)` method that deletes the user record and all their activities
- Frontend: Delete button per user in admin Users table (deletes user + their activity data)
- Frontend: Block/Unblock button per user in admin Users table
- Frontend: Blocked users list/indicator in admin panel
- Frontend: `BlockedScreen` component — full screen shown when a blocked user opens the app, showing "You have been blocked by the Admin." in large text, contact info below
- Frontend: On app load, check if user's email is blocked via backend `isBlocked(email)` and show BlockedScreen if true

### Modify
- AdminPanel.tsx: UsersTable to include Delete and Block buttons per row
- App.tsx: Check blocked status on load and conditionally render BlockedScreen
- useQueries.ts: Add new mutation/query hooks for block/delete user
- backend.d.ts: Add new method signatures

### Remove
- Nothing removed

## Implementation Plan
1. Update main.mo with blockedUsers map and new methods: blockUser, unblockUser, isBlocked, getAllBlockedUsers, deleteUser
2. Update backend.d.ts with new method signatures
3. Update useQueries.ts with new hooks: useBlockUser, useUnblockUser, useDeleteUser, useGetAllBlockedUsers
4. Create BlockedScreen component — large text "You have been blocked by the Admin.", contact info (sayedmohammadhamza45@gmail.com, WhatsApp +91 7838272313), styled prominently
5. Update App.tsx — on registration check, also call isBlocked(email), if blocked show BlockedScreen instead of app
6. Update AdminPanel.tsx UsersTable — add Delete button (with confirm dialog) and Block/Unblock toggle button per user row
7. Validate and build
