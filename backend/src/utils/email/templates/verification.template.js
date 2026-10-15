export const verificationTemplate = (otp) => ({
  subject: "Verify Your Email",

  text: `Your verification OTP is ${otp}.`,

  html: ` <div style="font-family: 'Montserrat', Arial, sans-serif; background: #f8f9fc; padding: 30px; color: #333;">


  <div style="max-width: 400px; margin: auto; background: #fff; padding: 25px; border-radius: 10px; text-align: center; border: 1px solid #eee;">

    <h2 style="color: #444;">Verify Your Email</h2>

    <p style="color: #777; font-size: 14px;">
      Use the code below to verify your email address.
    </p>

    <h1 style="color: #7c6ee6; letter-spacing: 6px;">
      ${otp}
    </h1>

    <p style="font-size: 12px; color: #999;">
      If you didn't request this, ignore this email.
    </p>

  </div>
</div>


`,
});
