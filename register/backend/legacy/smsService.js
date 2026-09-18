const nodemailer = require("nodemailer");

// Configure Nodemailer using your Gmail credentials from .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendOtpSms(phone, code, expiryMinutes) {
  try {
    // 1. MOCK MODE (For local development & testing)
    // If SMS_ALLOW_MOCK is true, print the OTP to the console instead of sending it.
    if (process.env.SMS_ALLOW_MOCK === "true") {
      console.log(`\n=========================================`);
      console.log(`[MOCK OTP] To: ${phone}`);
      console.log(`[MOCK OTP] Code: ${code} (Expires in ${expiryMinutes}m)`);
      console.log(`=========================================\n`);
      return { success: true, mock: true };
    }

    // 2. EMAIL-TO-SMS GATEWAY MODE
    // Clean the phone number to remove the '+' sign and any spaces
    const cleanPhone = phone.replace(/\D/g, "");

    // ⚠️ CRITICAL: Email-to-SMS requires the carrier's specific email gateway domain.
    // Example for a US carrier (Verizon): const carrierGateway = "vtext.com";
    const carrierGateway = "your-carrier-gateway.com"; // <-- You must change this!
    const targetEmail = `${cleanPhone}@${carrierGateway}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: targetEmail,
      subject: "Roadna OTP",
      text: `Your Roadna verification code is ${code}. It expires in ${expiryMinutes} minutes.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email-to-SMS sent successfully:", info.messageId);

    return { success: true, mock: false };

  } catch (error) {
    console.error("Failed to send Email-to-SMS:", error);
    throw new Error("Failed to deliver OTP.");
  }
}

module.exports = { sendOtpSms };
