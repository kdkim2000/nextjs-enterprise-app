/**
 * Email utility for MFA and notifications
 * In production, use nodemailer with real SMTP
 */

/**
 * Generate 6-digit MFA code
 */
function generateMFACode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send MFA code via email (mock)
 * In production, use nodemailer
 */
async function sendMFACode(email, code) {
  console.log(`[EMAIL MOCK] Sending MFA code to ${email}`);
  console.log(`[EMAIL MOCK] MFA Code: ${code}`);
  console.log(`[EMAIL MOCK] Valid for 5 minutes`);

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    message: 'MFA code sent successfully',
    // In development, return code for testing
    devCode: process.env.NODE_ENV === 'development' ? code : undefined
  };
}

/**
 * Send notification email (mock)
 */
async function sendNotification(email, subject, message) {
  console.log(`[EMAIL MOCK] To: ${email}`);
  console.log(`[EMAIL MOCK] Subject: ${subject}`);
  console.log(`[EMAIL MOCK] Message: ${message}`);

  await new Promise(resolve => setTimeout(resolve, 300));

  return { success: true };
}

module.exports = {
  generateMFACode,
  sendMFACode,
  sendNotification
};
