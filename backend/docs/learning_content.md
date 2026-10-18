Atomicity aur race conditions

1. OTP + Redis TTL
OTP ko expiry ke saath store karna sahi hai. OTP generation cryptographically secure honi chahiye.



2. BullMQ + worker
Email ko background mein process karna aur limited retries rakhna achha design hai.



3. Lua-based conditional cleanup
Final failure par sirf wahi OTP delete karna jo failed job ne create ki thi, concurrent requests ke liye useful protection hai.



4. Queue aur OTP consistency
Agar OTP Redis mein save ho jaye, lekin queue mein job add karne se pehle application crash ho jaye, toh OTP ki email kabhi send nahi hogi. Is failure ko recover karne ka plan chahiye.



5. Retry aur delivery ambiguity
SMTP timeout ke bawajood provider email accept kar chuka ho sakta hai. Retry se duplicate email ja sakti hai. Permanent aur temporary errors ko alag handle karo.





Phase 1 — Auth ke basic flows
- Signup
- Email OTP verification
- Login / Logout
- Refresh access token
- Forgot password / Reset password
- Change password
Goal: har flow ka logic aur happy path samajhna.




Phase 2 — Security aur concurrency
- Login aur OTP endpoints par rate limiting
- OTP ki expiry aur verification attempts ki limit
- One-time OTP verification ko atomic banana
- Refresh-token rotation aur reuse handling
- Password reset token ki expiry aur single-use validation




Phase 3 — Background jobs
- BullMQ email queue aur worker
- Retry aur exponential backoff
- Failed-job logging aur recovery
- Zaroorat par Lua-based conditional cleanup
Email sending jaise slow operations ko background mein shift karo.




Phase 4 — Testing aur review
- Unit tests
- Integration tests
- Concurrent OTP requests
- Invalid, expired aur repeatedly used tokens
- Redis ya email provider failure scenarios