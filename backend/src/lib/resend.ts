import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@propela.app';
const SUPPORT_EMAIL = process.env.RESEND_SUPPORT_EMAIL || 'support@propela.app';

// Email templates
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Propela <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error };
  }
}

// Welcome email
export async function sendWelcomeEmail(to: string, firstName: string) {
  return sendEmail({
    to,
    subject: 'Welcome to Propela! 🚀',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1f; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #5b9a8b; }
            .content { background: #f8f8fa; border-radius: 16px; padding: 30px; }
            .button { display: inline-block; background: #5b9a8b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b6b70; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Propela</div>
            </div>
            <div class="content">
              <h1>Welcome, ${firstName}! 🎉</h1>
              <p>You've just taken the first step toward better focus and productivity.</p>
              <p>Propela is designed with ADHD entrepreneurs in mind. Here's what you can do:</p>
              <ul>
                <li>🎯 Break projects into manageable tasks</li>
                <li>⏱️ Use focus sessions to stay on track</li>
                <li>📊 Track your progress and celebrate wins</li>
                <li>👥 Connect with a supportive community</li>
              </ul>
              <p>Remember: small steps lead to big results!</p>
              <a href="${process.env.FRONTEND_URL}" class="button">Open Propela</a>
            </div>
            <div class="footer">
              <p>Need help? Reply to this email or visit our Help Center.</p>
              <p>© ${new Date().getFullYear()} Propela. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

// Payment confirmation email
export async function sendPaymentConfirmationEmail(
  to: string,
  firstName: string,
  plan: string,
  amount: string,
  nextBillingDate?: string
) {
  const isLifetime = plan.toLowerCase() === 'lifetime';
  
  return sendEmail({
    to,
    subject: `Payment Confirmed – Welcome to Propela ${plan}! 💪`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1f; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #5b9a8b; }
            .content { background: #f8f8fa; border-radius: 16px; padding: 30px; }
            .receipt { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8e8eb; }
            .receipt-row:last-child { border-bottom: none; font-weight: 600; }
            .footer { text-align: center; margin-top: 30px; color: #6b6b70; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Propela</div>
            </div>
            <div class="content">
              <h1>Payment Confirmed! 🎉</h1>
              <p>Hey ${firstName}, thanks for upgrading to Propela ${plan}!</p>
              
              <div class="receipt">
                <div class="receipt-row">
                  <span>Plan</span>
                  <span>Propela ${plan}</span>
                </div>
                <div class="receipt-row">
                  <span>Amount</span>
                  <span>${amount}</span>
                </div>
                ${!isLifetime && nextBillingDate ? `
                <div class="receipt-row">
                  <span>Next billing date</span>
                  <span>${nextBillingDate}</span>
                </div>
                ` : ''}
              </div>
              
              <p>You now have access to all ${plan} features:</p>
              <ul>
                <li>✅ Unlimited projects and tasks</li>
                <li>✅ Extended focus sessions</li>
                <li>✅ Advanced analytics</li>
                <li>✅ Priority support</li>
                ${isLifetime ? '<li>✅ Lifetime access – no recurring charges!</li>' : ''}
              </ul>
            </div>
            <div class="footer">
              <p>Questions about your subscription? Reply to this email.</p>
              <p>© ${new Date().getFullYear()} Propela. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

// Subscription renewal reminder
export async function sendRenewalReminderEmail(
  to: string,
  firstName: string,
  plan: string,
  amount: string,
  renewalDate: string
) {
  return sendEmail({
    to,
    subject: `Your Propela ${plan} subscription renews soon`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1f; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #5b9a8b; }
            .content { background: #f8f8fa; border-radius: 16px; padding: 30px; }
            .notice { background: #e8a54b20; border-left: 4px solid #e8a54b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .button { display: inline-block; background: #5b9a8b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b6b70; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Propela</div>
            </div>
            <div class="content">
              <h1>Subscription Renewal Reminder</h1>
              <p>Hey ${firstName},</p>
              <p>Your Propela ${plan} subscription will automatically renew on <strong>${renewalDate}</strong>.</p>
              
              <div class="notice">
                <strong>Amount:</strong> ${amount}<br>
                <strong>Renewal date:</strong> ${renewalDate}
              </div>
              
              <p>No action needed if you want to continue enjoying your ${plan} benefits.</p>
              <p>Need to update your payment method or cancel? Manage your subscription anytime:</p>
              
              <a href="${process.env.FRONTEND_URL}/settings" class="button">Manage Subscription</a>
            </div>
            <div class="footer">
              <p>Questions? Reply to this email.</p>
              <p>© ${new Date().getFullYear()} Propela. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

// Help request notification (internal)
export async function sendHelpRequestNotification(
  request: {
    userName: string;
    userEmail: string;
    message: string;
    budget?: number;
    phone?: string;
    fileUrl?: string;
    externalUrl?: string;
  }
) {
  return sendEmail({
    to: SUPPORT_EMAIL,
    subject: `🆘 New Help Request from ${request.userName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1f; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .content { background: #f8f8fa; border-radius: 16px; padding: 30px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: 600; color: #6b6b70; font-size: 12px; text-transform: uppercase; }
            .value { margin-top: 4px; }
            .message { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h1>🆘 New Help Request</h1>
              
              <div class="field">
                <div class="label">From</div>
                <div class="value">${request.userName} (${request.userEmail})</div>
              </div>
              
              ${request.phone ? `
              <div class="field">
                <div class="label">Phone</div>
                <div class="value">${request.phone}</div>
              </div>
              ` : ''}
              
              ${request.budget ? `
              <div class="field">
                <div class="label">Budget</div>
                <div class="value">$${request.budget} USD</div>
              </div>
              ` : ''}
              
              <div class="field">
                <div class="label">Message</div>
                <div class="message">${request.message}</div>
              </div>
              
              ${request.fileUrl ? `
              <div class="field">
                <div class="label">Attached File</div>
                <div class="value"><a href="${request.fileUrl}">Download File</a></div>
              </div>
              ` : ''}
              
              ${request.externalUrl ? `
              <div class="field">
                <div class="label">External Link</div>
                <div class="value"><a href="${request.externalUrl}">${request.externalUrl}</a></div>
              </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

// Payment failed notification
export async function sendPaymentFailedEmail(
  to: string,
  firstName: string,
  plan: string
) {
  return sendEmail({
    to,
    subject: `Action Required: Payment Failed for Propela ${plan}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1f; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #5b9a8b; }
            .content { background: #f8f8fa; border-radius: 16px; padding: 30px; }
            .alert { background: #ef444420; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .button { display: inline-block; background: #5b9a8b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b6b70; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Propela</div>
            </div>
            <div class="content">
              <h1>Payment Failed ⚠️</h1>
              <p>Hey ${firstName},</p>
              <p>We couldn't process your payment for Propela ${plan}.</p>
              
              <div class="alert">
                <strong>What happens next?</strong><br>
                We'll retry the payment in a few days. To avoid any interruption to your ${plan} features, please update your payment method.
              </div>
              
              <a href="${process.env.FRONTEND_URL}/settings" class="button">Update Payment Method</a>
              
              <p style="margin-top: 20px;">If you have questions, just reply to this email – we're here to help!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Propela. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
