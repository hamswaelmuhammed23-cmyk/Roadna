const { normalizePhone } = require("../utils/validators")

let twilioClient = null
let twilioLoadAttempted = false
let twilioMissingLogged = false

function hasSmsSendConfig() {
  const from = (process.env.TWILIO_PHONE_NUMBER || "").trim()
  const messagingServiceSid = (process.env.TWILIO_MESSAGING_SERVICE_SID || "").trim()
  return !!(from || messagingServiceSid)
}

function getTwilioClient() {
  if (twilioClient) return twilioClient

  const sid   = (process.env.TWILIO_ACCOUNT_SID   || "").trim()
  const token = (process.env.TWILIO_AUTH_TOKEN     || "").trim()

  if (!sid || !token || !hasSmsSendConfig()) {
    return null
  }

  if (!twilioLoadAttempted) {
    twilioLoadAttempted = true
    try {
      const twilio = require("twilio")
      twilioClient = twilio(sid, token)
      console.log("[SMS] Twilio client initialised (SID:", sid.slice(0, 8) + "…)")
    } catch (err) {
      const missingTwilio =
        err.code === "MODULE_NOT_FOUND" ||
        (typeof err.message === "string" && err.message.includes("Cannot find module 'twilio'"))
      if (missingTwilio) {
        if (!twilioMissingLogged) {
          twilioMissingLogged = true
          console.error("[SMS] Package 'twilio' is not installed. From the backend folder run: npm install")
        }
        return null
      }
      console.error("[SMS] Failed to initialise Twilio client:", err.message)
      return null
    }
  }

  return twilioClient
}

function getFromNumber() {
  return (process.env.TWILIO_PHONE_NUMBER || "").trim()
}

function getMessagingServiceSid() {
  return (process.env.TWILIO_MESSAGING_SERVICE_SID || "").trim()
}

async function sendSms(to, message) {
  const toE164 = normalizePhone(String(to || "").trim())

  /*
  // ===========================================================================
  // LIVE TWILIO CLIENT CALLS COMMENTED OUT TO AVOID ACCIDENTAL RUNTIME API BILLS
  // ===========================================================================
  const client = getTwilioClient()
  if (client) {
    try {
      const payload = {
        body: message,
        to: toE164
      }
      const msid = getMessagingServiceSid()
      if (msid) {
        payload.messagingServiceSid = msid
      } else {
        payload.from = getFromNumber()
      }

      const result = await client.messages.create(payload)

      console.log(`[SMS] ✓ Sent to ${toE164} | SID: ${result.sid} | Status: ${result.status}`)
      return { success: true, sid: result.sid, status: result.status, mock: false }
    } catch (error) {
      console.error(`[SMS] ✗ Failed to send to ${toE164}`)
      console.error(`[SMS]   Code   : ${error.code || "N/A"}`)
      console.error(`[SMS]   Message: ${error.message}`)

      if (error.code === 21211) throw new Error("Invalid phone number format.")
      throw new Error(`SMS delivery failed: ${error.message}`)
    }
  }
  */

  // Safe mock OTP fallback mode console output
  console.log("────────────────────────────────────────────────")
  console.log("[SMS MOCK] Twilio API bypassed (mock fallback)")
  console.log(`[SMS MOCK] To   : ${toE164}`)
  console.log(`[SMS MOCK] Body : ${message}`)
  console.log("────────────────────────────────────────────────")
  return { 
    success: true, 
    mock: true, 
    sid: "mock_sid_" + Math.random().toString(36).substring(2, 9), 
    status: "delivered" 
  }
}

async function sendOtpSms(phone, code, expiryMinutes = 5) {
  const message =
    `Your Roadna verification code is: ${code}. ` +
    `Valid for ${expiryMinutes} minutes. ` +
    `Do not share this code with anyone.`
  return sendSms(phone, message)
}

module.exports = { sendSms, sendOtpSms, hasSmsSendConfig }
