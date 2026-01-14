// AI Email Generation Service
// Uses templates and personalization to craft compelling outreach emails

export interface EmailContext {
    companyName: string;
    industry?: string;
    website?: string;
    recipientEmail: string;
    senderName: string;
    senderCompany: string;
    campaignType: string;
    customFields?: Record<string, string>;
}

export interface GeneratedEmail {
    subject: string;
    htmlBody: string;
    textBody: string;
}

// Email templates by campaign type
const EMAIL_TEMPLATES: Record<string, { subjects: string[], bodies: string[] }> = {
    'REAM_CLEANING': {
        subjects: [
            'Professional Cleaning Services for {companyName}',
            'Quick Question About Your Cleaning Needs',
            'Elevate Your Workspace with Ream Cleaning'
        ],
        bodies: [
            `<p>Hello,</p>
<p>I noticed <strong>{companyName}</strong> is doing great work in the {industry} space. We're Ream Cleaning, and we specialize in professional commercial cleaning services.</p>
<p>Many businesses like yours have found that a consistently clean environment:</p>
<ul>
<li>Boosts employee productivity by up to 15%</li>
<li>Creates a better first impression for clients</li>
<li>Reduces sick days and maintains a healthier workspace</li>
</ul>
<p>Would you be open to a quick 10-minute call to see if we might be a fit?</p>
<p>Best regards,<br/>{senderName}<br/>{senderCompany}</p>`
        ]
    },
    'UNIDOXIA': {
        subjects: [
            'Document Management Solution for {companyName}',
            'Streamline Student Records with UniDoxia',
            'Quick Question About Your Documentation Process'
        ],
        bodies: [
            `<p>Dear Team at {companyName},</p>
<p>I'm reaching out because UniDoxia helps educational institutions streamline their document management processes.</p>
<p>Our platform offers:</p>
<ul>
<li>Automated document verification and processing</li>
<li>Secure student record management</li>
<li>Integration with existing systems</li>
<li>Compliance with educational data regulations</li>
</ul>
<p>Would you be interested in seeing a quick demo of how other institutions are saving 20+ hours per week?</p>
<p>Best,<br/>{senderName}<br/>{senderCompany}</p>`
        ]
    },
    'COLD_OUTREACH': {
        subjects: [
            'Quick question about {companyName}',
            'Idea for {companyName}',
            '{senderCompany} + {companyName}'
        ],
        bodies: [
            `<p>Hi there,</p>
<p>I came across {companyName} and was impressed by what you're building in the {industry} space.</p>
<p>I'm {senderName} from {senderCompany}. We help businesses like yours [describe value proposition].</p>
<p>Would you be open to a brief chat to explore if there's a fit?</p>
<p>No pressure either way - just thought it might be worth a conversation.</p>
<p>Best,<br/>{senderName}</p>`
        ]
    },
    'FOLLOW_UP': {
        subjects: [
            'Following up on my previous email',
            'Did you get a chance to review?',
            'Circling back - {companyName}'
        ],
        bodies: [
            `<p>Hi,</p>
<p>I wanted to follow up on my previous message about [service/product].</p>
<p>I understand you're busy, so I'll keep this brief. If you have 15 minutes this week, I'd love to show you how we can help {companyName}.</p>
<p>Would [suggest specific times] work for a quick call?</p>
<p>Thanks,<br/>{senderName}</p>`
        ]
    }
};

export function generateEmail(context: EmailContext): GeneratedEmail {
    const templates = EMAIL_TEMPLATES[context.campaignType] || EMAIL_TEMPLATES['COLD_OUTREACH'];

    // Select random template variation
    const subjectTemplate = templates.subjects[Math.floor(Math.random() * templates.subjects.length)];
    const bodyTemplate = templates.bodies[Math.floor(Math.random() * templates.bodies.length)];

    // Replace placeholders
    const replacePlaceholders = (text: string): string => {
        return text
            .replace(/{companyName}/g, context.companyName)
            .replace(/{industry}/g, context.industry || 'business')
            .replace(/{website}/g, context.website || '')
            .replace(/{senderName}/g, context.senderName)
            .replace(/{senderCompany}/g, context.senderCompany)
            .replace(/{recipientEmail}/g, context.recipientEmail);
    };

    const subject = replacePlaceholders(subjectTemplate);
    const htmlBody = replacePlaceholders(bodyTemplate);

    // Generate plain text version
    const textBody = htmlBody
        .replace(/<p>/g, '\n')
        .replace(/<\/p>/g, '\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<li>/g, '• ')
        .replace(/<\/li>/g, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return {
        subject,
        htmlBody,
        textBody
    };
}

// Personalize email with AI-style touches (without actual AI API call)
export function addPersonalization(email: GeneratedEmail, leadData: any): GeneratedEmail {
    let { htmlBody } = email;

    // Add personalized opening based on available data
    if (leadData.location) {
        const greeting = getLocationGreeting(leadData.location);
        if (greeting) {
            htmlBody = htmlBody.replace('<p>Hello,</p>', `<p>Hello from ${greeting}!</p>`);
            htmlBody = htmlBody.replace('<p>Hi there,</p>', `<p>Hi from ${greeting}!</p>`);
        }
    }

    return {
        ...email,
        htmlBody
    };
}

function getLocationGreeting(location: string): string | null {
    const greetings: Record<string, string> = {
        'London': 'London',
        'UK': 'the UK',
        'USA': 'across the pond',
        'San Francisco': 'sunny San Francisco',
        'New York': 'NYC'
    };

    for (const [key, value] of Object.entries(greetings)) {
        if (location.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }
    return null;
}

// Validate email before sending
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if email is likely a role-based address
export function isRoleBasedEmail(email: string): boolean {
    const rolePatterns = [
        'info@', 'contact@', 'hello@', 'admin@', 'support@',
        'sales@', 'marketing@', 'team@', 'office@', 'careers@',
        'jobs@', 'hr@', 'press@', 'media@', 'enquiries@', 'inquiries@'
    ];
    return rolePatterns.some(pattern => email.toLowerCase().startsWith(pattern));
}
