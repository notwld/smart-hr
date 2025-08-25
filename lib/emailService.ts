import emailjs from '@emailjs/browser';

// Email.js configuration - you'll need to set up these environment variables
const EMAILJS_SERVICE_ID = "service_4y2ee5a";
const EMAILJS_TEMPLATE_ID = "template_60v824x";
const EMAILJS_PUBLIC_KEY = "m-dzotjw9liM4V01k";

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

interface WelcomeEmailData {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    loginEmail: string;
    portalUrl?: string;
}

export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<boolean> => {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        console.error('❌ Email.js configuration missing. Please set up environment variables.');
        console.log('Missing:', { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY });
        return false;
    }

    console.log('📧 Preparing to send welcome email to:', data.email);
    console.log('📋 Email data:', data);

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

 Your employee portal is now active!

Portal URL: ${data.portalUrl || 'https://portal.mizetechnologies.com/'}
Login Email: ${data.loginEmail}

If you have any questions, please contact us at hr@mizetechnologies.com

Welcome aboard!

Best regards,
Mize Technologies HR Team`
        };

        console.log('📤 Sending email with template params:', templateParams);

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('✅ Welcome email sent successfully!');
        console.log('📥 Email.js response:', response);
        return true;
    } catch (error: any) {
        console.error('❌ Failed to send welcome email:', error);
        console.log('🔍 Error details:', {
            name: error.name,
            message: error.message,
            status: error.status,
            text: error.text
        });
        return false;
    }
};

// HTML Email Template (for reference when creating the EmailJS template)
export const welcomeEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Mize Technologies</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #06b6d4, #2563eb); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .welcome-section { text-align: center; margin-bottom: 30px; }
        .welcome-section h2 { color: #1f2937; margin: 0 0 15px 0; font-size: 24px; }
        .welcome-section p { color: #6b7280; font-size: 16px; line-height: 1.6; }
        .info-card { background-color: #dff9ff; border-left: 4px solid #06b6d4; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .info-row { margin: 10px 0; }
        .info-label { font-weight: bold; color: #374151; display: inline-block; width: 120px; }
        .info-value { color: #6b7280; }
        .portal-section { background: linear-gradient(135deg, #06b6d4, #2563eb); border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0; }
        .portal-button { display: inline-block; background-color: white; color: #2563eb; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .portal-button:hover { transform: translateY(-2px); }
        .next-steps { background-color: #f3f4f6; border-radius: 8px; padding: 25px; margin: 30px 0; }
        .next-steps h3 { color: #1f2937; margin-top: 0; }
        .next-steps ul { color: #6b7280; padding-left: 20px; }
        .next-steps li { margin: 8px 0; }
        .footer { background-color: #1f2937; color: white; text-align: center; padding: 30px; }
        .footer p { margin: 5px 0; }
        .footer a { color: #06b6d4; text-decoration: none; }
        .divider { height: 2px; background: linear-gradient(90deg, #06b6d4, #2563eb); margin: 30px 0; border-radius: 1px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Welcome to Mize Technologies!</h1>
            <p>Your journey with us begins now</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <!-- Welcome Message -->
            <div class="welcome-section">
                <h2>Hello {{employee_name}}!</h2>
                <p>We're thrilled to have you join our team at Mize Technologies. Your onboarding has been completed successfully, and we're excited to see the amazing contributions you'll make to our organization.</p>
            </div>
            
            
            <!-- Portal Access -->
            <div class="portal-section">
                <h3 style="color: white; margin-top: 0; font-size: 20px;"> Access Your Portal</h3>
                <p style="color: rgba(255,255,255,0.9); margin: 15px 0;">Your employee portal is now active! Use your registered email address to sign in and explore all the features available to you.</p>
                <a href="{{portal_url}}" class="portal-button">Visit Portal</a>
                <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 15px;">Login Email: {{login_email}}</p>
            </div>
            
            <!-- Next Steps -->
            <div class="next-steps">
                <h3>📝 What's Next?</h3>
                <ul>
                    <li><strong>Complete your profile:</strong> Add any additional information in your portal</li>
                    <li><strong>Explore features:</strong> Check out attendance tracking, leave management, and team collaboration tools</li>
                    <li><strong>Connect with your team:</strong> Use the built-in chat system to communicate with colleagues</li>
                    <li><strong>Stay organized:</strong> View your dashboard for important updates and notifications</li>
                </ul>
            </div>
            
            <div class="divider"></div>
            
            <!-- Support Section -->
            <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #1f2937;">Need Help? We're Here for You!</h3>
                <p style="color: #6b7280;">If you have any questions or need assistance, don't hesitate to reach out:</p>
                <p style="color: #6b7280;">
                    📧 Email: <a href="mailto:{{hr_contact}}" style="color: #06b6d4;">{{hr_contact}}</a><br>
                    📞 Phone: {{support_phone}}
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Mize Technologies</strong></p>
            <p>Empowering people through seamless  management</p>
            <p style="font-size: 12px; margin-top: 15px;">
                © {{current_year}} Mize Technologies. All rights reserved.<br>
                <a href="{{portal_url}}">{{portal_url}}</a>
            </p>
        </div>
    </div>
</body>
</html>
`;
