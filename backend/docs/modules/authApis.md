Auth
├── Signup
├── Verify Email
├── Resend OTP
├── Login
├── Logout
├── Refresh Token
├── Forgot Password
├── Reset Password
└── Change Password

POST /api/v1/auth/signup
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-otp

POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token

POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
PATCH /api/v1/auth/change-password

-------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------------------------------------


AUTHENTICATION FEATURE FLOW 

01) SIGNUP FLOW 
    ↓
name + email + password
    ↓
Input Validation
    ↓
Check email in DB
    ↓
Already exists?
 ┌───────────────┐
 │ YES           │ NO
 ↓               ↓
Error        Generate OTP
             ↓
        OTP Redis mein save
             ↓
        OTP email send
             ↓
        User OTP submit
             ↓
        OTP validate
             ↓
        OTP correct?
       ┌───────────┐
       │ YES       │ NO
       ↓           ↓
   Create User   Error
       ↓
   Generate Access Token
   Generate Refresh Token
       ↓
   Hash Refresh Token
       ↓
   Save Refresh Token
       ↓
   Access Token → Cookie
       ↓
     Signup Complete


------------------------------------------
-----------------------------------------

02) LOGIN FLOW 
    ↓
email + password
    ↓
Input Validation
    ↓
Find User by Email
    ↓
User exists?
 ┌───────────────┐
 │ NO            │ YES
 ↓               ↓
Error       Compare Password
                ↓
          Password correct?
          ┌───────────┐
          │ NO        │ YES
          ↓           ↓
        Error      Generate Tokens
                       ↓
              Access Token
              Refresh Token
                       ↓
              Hash Refresh Token
                       ↓
              Save/Update Session
                       ↓
              Access Token → Cookie
                       ↓
                   Logged In


  

--------------------------------------------------
--------------------------------------------------

03) FORGOT PASSWORD FLOW
        ↓
Enter Email
        ↓
Validate Email
        ↓
Check User in DB
        ↓
User exists?
    ┌───────┴────────┐
   NO               YES
   ↓                 ↓
Error          Generate OTP
                     ↓
              Save OTP in Redis
                     ↓
              Send OTP via Email
                     ↓
              User enters OTP
                     ↓
              Verify OTP
                ↓       ↓
              Wrong    Correct
                ↓        ↓
             Error    Allow Password Reset
                         ↓
                  New Password
                  Confirm Password
                         ↓
                  Validate Password
                         ↓
                  Hash Password
                         ↓
                  Update DB
                         ↓
                Password Reset Done


------------------------------------
------------------------------------

04) RESET PASSWORD FLOW

        User OTP verify karta hai
                ↓
        OTP valid?
          ┌────┴────┐
          NO        YES
          ↓          ↓
        Error     New Password
                  Confirm Password
                        ↓
                  Validate Password
                        ↓
                  Hash Password
                        ↓
                  Update User
                        ↓
            Invalidate Refresh Token
                        ↓
              Password Reset Successful
                        ↓
                  Login Again

---------------------------------------------------
---------------------------------------------------

05) LOGOUT FLOW 

      User → Logout Button
          ↓
      POST /auth/logout
          ↓
      Auth Middleware
          ↓
      Access Token Verify
          ↓
      Get User ID
          ↓
      Find User
          ↓
      Refresh Token = ""
          ↓
      Clear Access Token Cookie
          ↓
      Logout Successful

---------------------------------------------------
---------------------------------------------------

06) REFRESH TOKEN FLOW

          User Request
     ↓
POST /api/v1/auth/refresh-token
     ↓
Refresh Token receive karo
     ↓
Refresh Token verify karo
     ↓
JWT se userId nikalo
     ↓
User ko DB se find karo
     ↓
DB mein stored hashed Refresh Token
     ↓
Received Refresh Token ko hash/compare karo
     ↓
Token valid?
   ┌───────┴────────┐
  NO                YES
  ↓                  ↓
Error          Generate new Access Token
               Generate new Refresh Token
                       ↓
               Hash new Refresh Token
                       ↓
               DB mein update
                       ↓
               New Access Token
               → Cookie
                       ↓
                Response  


--------------------------------------------------------------
--------------------------------------------------------------

07) CHANGE PASSWORD FLOW 
                    ↓
          Auth Middleware
                    ↓
          Access Token Verify
                    ↓
          req.user → userId
                    ↓
          Find User in DB
                    ↓
          Current Password
          New Password
          Confirm Password
                    ↓
          Validate Input
                    ↓
          Compare Current Password
          with Stored Password Hash
                    ↓
          Password Correct?
                ┌───────┴───────┐
                NO              YES
                ↓                 ↓
            Error         Compare New Password
                          + Confirm Password
                                ↓
                            Match?
                          ┌───────┴───────┐
                        NO              YES
                        ↓                 ↓
                      Error          Hash New Password
                                            ↓
                                    Update User Password
                                            ↓
                                  Invalidate Refresh Token
                                            ↓
                                      Password Changed
                                            ↓
                                      Login Again


08) RESEND OTP 
  sab sy pehly user email dy ga 
  hum us email k basis pr redis ma check krain gay k otp h ya nhi 
  agr otp h tou 2 options hain ya tou otp koo del kr k new otp email pr send karain or new otp koo save kr lain ya tou error dain 







  POST /api/auth/resend-verification-otp
POST /api/auth/forgot-password
POST /api/auth/resend-password-reset-otp