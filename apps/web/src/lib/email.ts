// Email Service - Handles email sending via Gmail or SMTP
// In production, you'd integrate Gmail OAuth or a service like SendGrid/Resend

export interface EmailPayload {
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    from?: string;
    replyTo?: string;
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Mock email sender for development (no external dependencies needed)
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
    // In production, this would integrate with Gmail API, SendGrid, Resend, etc.
    console.log('📧 Email would be sent:', {
        to: payload.to,
        subject: payload.subject,
        preview: payload.htmlBody.substring(0, 100) + '...'
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo purposes, simulate success
    return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };
}

// Gmail OAuth integration (when API keys are configured)
export async function sendViaGmail(payload: EmailPayload, accessToken: string): Promise<EmailResult> {
    try {
        const message = createMimeMessage(payload);

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                raw: Buffer.from(message).toString('base64url')
            })
        });

        if (!response.ok) {
            throw new Error(`Gmail API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            success: true,
            messageId: data.id
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

function createMimeMessage(payload: EmailPayload): string {
    const boundary = `boundary_${Date.now()}`;

    return [
        `From: ${payload.from || 'noreply@example.com'}`,
        `To: ${payload.to}`,
        `Subject: ${payload.subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        '',
        payload.textBody || stripHtml(payload.htmlBody),
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        '',
        payload.htmlBody,
        '',
        `--${boundary}--`
    ].join('\r\n');
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Compliance footer generator
export function generateComplianceFooter(unsubscribeUrl: string, postalAddress: string): string {
    return `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>This email was sent to you because we believe our services may be relevant to your business.</p>
            <p><a href="${unsubscribeUrl}" style="color: #2563eb;">Unsubscribe</a> | ${postalAddress}</p>
        </div>
    `;
}
