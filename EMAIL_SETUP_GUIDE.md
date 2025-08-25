# Email.js Setup Guide for Welcome Emails

This guide will help you set up Email.js to send professional welcome emails to new employees when they complete onboarding.

## 🔧 Email.js Configuration

### Step 1: Create Email.js Account
1. Go to [Email.js](https://www.emailjs.com/) and create a free account
2. Create a new service (Gmail, Outlook, etc.)
3. Create an email template with the provided HTML template

### Step 2: Environment Variables
Add these variables to your `.env.local` file:

```env
# Email.js Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID="your_service_id_here"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="your_template_id_here"  
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="your_public_key_here"
```

### Step 3: Email Template Setup
1. In Email.js dashboard, create a new template
2. Use the HTML template from `lib/emailService.ts` (welcomeEmailTemplate)
3. Configure these template variables:

#### Template Variables:
- `{{to_email}}` - Recipient email
- `{{to_name}}` - Recipient name
- `{{employee_name}}` - Full employee name
- `{{employee_email}}` - Employee email
- `{{employee_department}}` - Employee department
- `{{employee_position}}` - Employee position
- `{{login_email}}` - Login email (same as employee_email)
- `{{company_name}}` - Company name (Mize Technologies)
- `{{portal_url}}` - Portal URL (https://portal.mizetechnologies.com/)
- `{{subject}}` - Email subject
- `{{current_year}}` - Current year
- `{{hr_contact}}` - HR contact email
- `{{support_phone}}` - Support phone number

### Step 4: Email Template HTML
Use this professional HTML template in your Email.js template editor:

```html
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
            <h1>🎉 Welcome to Mize Technologies!</h1>
            <p>Your journey with us begins now</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <!-- Welcome Message -->
            <div class="welcome-section">
                <h2>Hello {{employee_name}}!</h2>
                <p>We're thrilled to have you join our team at Mize Technologies. Your onboarding has been completed successfully, and we're excited to see the amazing contributions you'll make to our organization.</p>
            </div>
            
            <div class="divider"></div>
            
            <!-- Employee Information -->
            <div class="info-card">
                <h3 style="margin-top: 0; color: #0891b2;">📋 Your Employee Details</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">{{employee_name}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{employee_email}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Department:</span>
                    <span class="info-value">{{employee_department}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Position:</span>
                    <span class="info-value">{{employee_position}}</span>
                </div>
            </div>
            
            <!-- Portal Access -->
            <div class="portal-section">
                <h3 style="color: white; margin-top: 0; font-size: 20px;">🚀 Access Your HR Portal</h3>
                <p style="color: rgba(255,255,255,0.9); margin: 15px 0;">Your employee portal is now active! Use your registered email address to sign in and explore all the features available to you.</p>
                <a href="{{portal_url}}" class="portal-button">Access HR Portal →</a>
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
            <p>Empowering people through seamless HR management</p>
            <p style="font-size: 12px; margin-top: 15px;">
                © {{current_year}} Mize Technologies. All rights reserved.<br>
                <a href="{{portal_url}}">{{portal_url}}</a>
            </p>
        </div>
    </div>
</body>
</html>
```

## 🎨 Email Features

### Professional Design
- **Gradient header** with Mize Technologies branding
- **Clean layout** with proper spacing and typography
- **Mobile responsive** design
- **Professional color scheme** using cyan and blue gradients

### Content Sections
1. **Welcome header** with company branding
2. **Personal greeting** with employee name
3. **Employee details card** with role information
4. **Portal access section** with direct link to portal
5. **Next steps guide** for new employees
6. **Support contact information**
7. **Professional footer** with company details

### Interactive Elements
- **Portal access button** with hover effects
- **Direct mailto links** for HR contact
- **Clickable portal URL**

## 🚀 Usage

The welcome email is automatically sent when:
1. Employee completes onboarding successfully
2. All required fields are validated
3. User session is updated
4. Email.js configuration is properly set up

## 🔍 Testing

To test the email functionality:
1. Complete the Email.js setup above
2. Complete the onboarding process
3. Check the console for email sending logs
4. Verify the email was received in the employee's inbox

## 📧 Email Content Preview

The email includes:
- **Welcome message** with employee's name
- **Employee details** (name, email, department, position)
- **Portal login instructions** with direct link
- **Next steps** for getting started
- **HR contact information** for support
- **Professional branding** consistent with company theme

## 🛠️ Troubleshooting

### Email not sending:
1. Check environment variables are set correctly
2. Verify Email.js service is active
3. Check browser console for error messages
4. Ensure template ID matches your Email.js template

### Template not rendering correctly:
1. Verify all template variables are included
2. Check HTML syntax in Email.js template editor
3. Test template with sample data

The email system is now integrated into your onboarding flow and will provide a professional welcome experience for new employees!

