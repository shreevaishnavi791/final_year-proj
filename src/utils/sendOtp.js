/**
 * sendOtp.js
 * Sends a real OTP SMS to the given Indian mobile number using Fast2SMS API.
 *
 * HOW TO GET YOUR FREE API KEY:
 * 1. Visit https://www.fast2sms.com/ and create a FREE account
 * 2. Go to Dashboard → Dev API
 * 3. Copy the "Authorization" key
 * 4. Paste it in your .env file as: VITE_FAST2SMS_API_KEY=your_key_here
 * 5. Restart your dev server (npm run dev)
 *
 * Fast2SMS Free Plan:
 *  - 2000 free SMS credits on signup
 *  - Supports all Indian mobile numbers
 *  - No DLT registration required for OTP messages on dev plan
 */

const FAST2SMS_API_KEY = import.meta.env.VITE_FAST2SMS_API_KEY;

/**
 * Generates a cryptographically secure 6-digit OTP
 * @returns {string} 6-digit OTP string
 */
export const generateOtp = () => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const otp = (array[0] % 900000) + 100000; // Ensures range 100000–999999
  return otp.toString();
};

/**
 * Sends an OTP to the specified mobile number via Fast2SMS
 * @param {string} phone - 10-digit Indian mobile number
 * @param {string} otp   - 6-digit OTP to send
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendOtpSms = async (phone, otp) => {
  // Validate API key is configured
  if (!FAST2SMS_API_KEY || FAST2SMS_API_KEY === "your_fast2sms_api_key_here") {
    console.error("Fast2SMS API key is not configured in .env file");
    throw new Error(
      "SMS service is not configured. Please set VITE_FAST2SMS_API_KEY in your .env file."
    );
  }

  // Validate phone number (10 digits, Indian number)
  const cleanPhone = phone.replace(/\D/g, ""); // Remove non-digits
  if (cleanPhone.length !== 10) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }

  // Check if we are in Demo Mode for Free Testing
  const IS_DEMO_MODE = import.meta.env.VITE_USE_DEMO_OTP === "true";

  if (IS_DEMO_MODE) {
    console.log("----------------- DEMO OTP MODE -----------------");
    console.log(`MOBILE: +91${cleanPhone}`);
    console.log(`OTP CODE: ${otp}`);
    console.log("--------------------------------------------------");
    
    // Simulate a short delay like a real network request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Show an alert so you can see the OTP without opening the console
    alert(`[DEMO MODE] OTP for ${cleanPhone} is: ${otp}`);
    
    return { success: true, message: "OTP sent successfully (Demo Mode)" };
  }

  // Simplified message to avoid brand keyword blocks
  const message = `Your code is ${otp}`;

  try {
    // Fast2SMS often works better with GET for Quick SMS (route=q)
    // We use the proxy defined in vite.config.js
    const params = new URLSearchParams({
      authorization: FAST2SMS_API_KEY.trim(),
      route: "q",
      message: message,
      language: "english",
      numbers: cleanPhone,
      flash: "0" // 0 for normal SMS
    });

    const response = await fetch(`/api/otp?${params.toString()}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    if (response.ok && data.return === true) {
      console.log(`OTP SMS sent successfully to +91${cleanPhone}`);
      return { success: true, message: "OTP sent successfully" };
    } else {
      console.error("Fast2SMS error response:", data);
      throw new Error(data.message || "Failed to send OTP. Please check your balance or API key.");
    }
  } catch (err) {
    console.error("OTP Send Catch Block:", err);
    throw err;
  }
};
