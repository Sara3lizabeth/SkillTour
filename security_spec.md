# Security Specification for Skilltour Academy

## Data Invariants
1. A lesson must belong to a module and a course.
2. An exam must belong to a course.
3. Progress records must link a valid user to a valid course.
4. Certificates can only be issued if a user has completed a course.
5. Users cannot change their own role unless they are an admin.

## The "Dirty Dozen" Payloads (Denial Tests)
1. Creating a user profile with role: 'admin' by a non-admin.
2. Updating 'courses' collection by a non-admin.
3. Reading another user's 'progress' record.
4. Overwriting 'certificates' by a student.
5. Deleting a 'course' by a student.
6. Creating a 'lesson' with a massive content string (Resource Poisoning).
7. Updating 'progress' of another user by changing 'userId' field.
8. Bypassing 'courseId' in 'lessons' sub-collection to access orphaned data.
9. Modifying 'createdAt' field on a course after creation.
10. Reading 'users' collection without authentication.
11. Listing all 'certificates' in the system (Query scraping).
12. Creating a 'progress' record for a non-existent course.

## Test Runner Logic
The `firestore.rules` will be validated against these scenarios.
The rules will enforce:
- `isOwner()`: `request.auth.uid == userId`
- `isAdmin()`: `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'` (Note: Since we use custom roles in Firestore)
- `isValidCourse()`: Schema check for courses.
- `isValidLesson()`: Schema check for lessons.
