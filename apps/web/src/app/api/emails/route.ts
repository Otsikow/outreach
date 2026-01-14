import { prisma } from '@outreach/db';
import { NextRequest, NextResponse } from 'next/server';
import { generateEmail, addPersonalization } from '@/lib/ai-email';
import { sendEmail, generateComplianceFooter } from '@/lib/email';

// GET: List drafts with optional filters
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const campaignId = searchParams.get('campaignId');
        const leadId = searchParams.get('leadId');

        const where: any = {};
        if (status) where.status = status;
        if (campaignId) where.campaignId = campaignId;
        if (leadId) where.leadId = leadId;

        const drafts = await prisma.draftEmail.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                lead: true,
                campaign: true
            }
        });

        return NextResponse.json(drafts);
    } catch (error) {
        console.error('Failed to fetch drafts:', error);
        return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
    }
}

// POST: Generate a new email draft
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { leadId, campaignId } = body;

        if (!leadId || !campaignId) {
            return NextResponse.json({ error: 'leadId and campaignId are required' }, { status: 400 });
        }

        // Fetch lead and campaign data
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { contactMethods: true }
        });

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!lead || !campaign) {
            return NextResponse.json({ error: 'Lead or Campaign not found' }, { status: 404 });
        }

        // Get primary email contact
        const primaryContact = lead.contactMethods.find(c => c.type === 'EMAIL');
        const toAddress = primaryContact?.value || `contact@${lead.website || 'unknown.com'}`;

        // Generate the email
        const emailContext = {
            companyName: lead.companyName,
            industry: lead.industry || undefined,
            website: lead.website || undefined,
            recipientEmail: toAddress,
            senderName: 'Your Name', // Would come from user profile
            senderCompany: 'Your Company', // Would come from workspace settings
            campaignType: campaign.type
        };

        let generatedEmail = generateEmail(emailContext);
        generatedEmail = addPersonalization(generatedEmail, lead);

        // Add compliance footer
        const unsubscribeUrl = `${process.env.APP_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(toAddress)}`;
        const postalAddress = process.env.SENDER_POSTAL_ADDRESS || 'Your Business Address';
        const footer = generateComplianceFooter(unsubscribeUrl, postalAddress);

        generatedEmail.htmlBody += footer;

        // Save draft to database
        const draft = await prisma.draftEmail.create({
            data: {
                leadId,
                campaignId,
                status: 'DRAFT',
                subject: generatedEmail.subject,
                bodyHtml: generatedEmail.htmlBody,
                toAddress
            },
            include: {
                lead: true,
                campaign: true
            }
        });

        // Update lead status
        await prisma.lead.update({
            where: { id: leadId },
            data: { status: 'DRAFTED' }
        });

        return NextResponse.json(draft);
    } catch (error) {
        console.error('Failed to generate draft:', error);
        return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 });
    }
}

// PUT: Update draft or send email
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, action, subject, bodyHtml, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'Draft id is required' }, { status: 400 });
        }

        const draft = await prisma.draftEmail.findUnique({
            where: { id },
            include: {
                lead: { include: { contactMethods: true } },
                campaign: true
            }
        });

        if (!draft) {
            return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
        }

        // Handle different actions
        if (action === 'send') {
            // Send the email
            const result = await sendEmail({
                to: draft.toAddress,
                subject: draft.subject,
                htmlBody: draft.bodyHtml
            });

            if (result.success) {
                // Update draft status
                const updatedDraft = await prisma.draftEmail.update({
                    where: { id },
                    data: { status: 'SENT' }
                });

                // Get or create contact method
                let contactMethod = draft.lead.contactMethods.find(c => c.value === draft.toAddress);
                if (!contactMethod) {
                    contactMethod = await prisma.contactMethod.create({
                        data: {
                            leadId: draft.leadId,
                            type: 'EMAIL',
                            value: draft.toAddress,
                            isRoleBased: draft.toAddress.startsWith('info@') || draft.toAddress.startsWith('contact@'),
                            isVerified: false
                        }
                    });
                }

                // Create send event
                await prisma.sendEvent.create({
                    data: {
                        draftEmailId: id,
                        contactMethodId: contactMethod.id,
                        messageId: result.messageId,
                        provider: 'INTERNAL' // Would be GMAIL, OUTLOOK, etc.
                    }
                });

                // Update lead status
                await prisma.lead.update({
                    where: { id: draft.leadId },
                    data: { status: 'SENT' }
                });

                return NextResponse.json({
                    success: true,
                    messageId: result.messageId,
                    draft: updatedDraft
                });
            } else {
                return NextResponse.json({ error: result.error || 'Failed to send' }, { status: 500 });
            }
        } else if (action === 'approve') {
            const updatedDraft = await prisma.draftEmail.update({
                where: { id },
                data: { status: 'APPROVED' }
            });

            // Create approval item
            await prisma.approvalItem.create({
                data: {
                    draftEmailId: id,
                    leadId: draft.leadId,
                    status: 'APPROVED',
                    reviewedAt: new Date()
                }
            });

            // Update lead status
            await prisma.lead.update({
                where: { id: draft.leadId },
                data: { status: 'APPROVED' }
            });

            return NextResponse.json(updatedDraft);
        } else if (action === 'reject') {
            const updatedDraft = await prisma.draftEmail.update({
                where: { id },
                data: { status: 'REJECTED' }
            });

            await prisma.approvalItem.create({
                data: {
                    draftEmailId: id,
                    leadId: draft.leadId,
                    status: 'REJECTED',
                    reviewedAt: new Date()
                }
            });

            return NextResponse.json(updatedDraft);
        } else {
            // Update draft content
            const updatedDraft = await prisma.draftEmail.update({
                where: { id },
                data: {
                    ...(subject && { subject }),
                    ...(bodyHtml && { bodyHtml }),
                    ...(status && { status })
                }
            });

            return NextResponse.json(updatedDraft);
        }
    } catch (error) {
        console.error('Failed to update/send draft:', error);
        return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
}
