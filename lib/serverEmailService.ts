// Server-side email service using Email.js REST API
interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  loginEmail: string;
  portalUrl?: string;
}

const EMAILJS_SERVICE_ID = "service_4y2ee5a";
const EMAILJS_TEMPLATE_ID = "template_60v824x";
const EMAILJS_PUBLIC_KEY = "m-dzotjw9liM4V01k";

export const sendWelcomeEmailServer = async (data: WelcomeEmailData): Promise<boolean> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.error('❌ Server Email.js configuration missing');
    return false;
  }

  console.log('📧 Server: Preparing to send welcome email to:', data.email);

  try {
    const templateParams = {
      // Recipient info - multiple formats to ensure compatibility
      to_email: data.email,
      to_name: `${data.firstName} ${data.lastName}`,
      name: `${data.firstName} ${data.lastName}`,

      // Employee details
      employee_name: `${data.firstName} ${data.lastName}`,
      employee_email: data.email,
      employee_department: data.department,
      employee_position: data.position,
      login_email: data.loginEmail,

      // Individual name parts
      first_name: data.firstName,
      last_name: data.lastName,

      // Company info
      company_name: 'Mize Technologies',
      portal_url: data.portalUrl || 'https://portal.mizetechnologies.com/',

      // Email content
      subject: `Welcome to Mize Technologies, ${data.firstName}!`,
      current_year: new Date().getFullYear(),

      // Additional template variables
      hr_contact: 'hr@mizetechnologies.com',
      support_phone: '+92-XXX-XXXXXXX',
      
      // Main message content
      message: `Dear ${data.firstName},

We're thrilled to have you join our team at Mize Technologies! Your onboarding has been completed successfully, and we're excited to see the amazing contributions you'll make to our organization.

🚀 Your employee portal is now active!

Portal URL: ${data.portalUrl || 'https://portal.mizetechnologies.com/'}
Login Email: ${data.loginEmail}

Use your registered email address to sign in and explore all the features available to you, including:
• Attendance tracking
• Leave management  
• Team collaboration tools
• Performance dashboard

If you have any questions, please contact us at hr@mizetechnologies.com

Welcome aboard!

Best regards,
Mize Technologies HR Team`
    };

    console.log('📤 Server: Sending email with Email.js REST API');

    // Use Email.js REST API endpoint
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      console.log('✅ Server: Welcome email sent successfully!');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Server: Email.js API error:', response.status, errorText);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Server: Failed to send welcome email:', error);
    return false;
  }
};
