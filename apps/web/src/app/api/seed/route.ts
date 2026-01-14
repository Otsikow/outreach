import { prisma } from '@outreach/db';
import { NextResponse } from 'next/server';

// SEED / RESET Route (For demo purposes)
export async function POST() {
    // Check if we have data
    const count = await prisma.lead.count();
    if (count > 0) return NextResponse.json({ msg: 'Already seeded' });

    // Create Workspace
    const ws = await prisma.workspace.create({
        data: { name: 'Main Workspace' }
    });

    // Create Leads with Contact Methods
    const lead1 = await prisma.lead.create({
        data: {
            workspaceId: ws.id,
            companyName: 'Stanford University',
            website: 'stanford.edu',
            status: 'RESEARCHED',
            industry: 'Education',
            location: 'Palo Alto, CA',
            contactMethods: {
                create: [
                    { type: 'EMAIL', value: 'admissions@stanford.edu', isRoleBased: true, isVerified: true },
                    { type: 'EMAIL', value: 'info@stanford.edu', isRoleBased: true, isVerified: true },
                    { type: 'EMAIL', value: 'media@stanford.edu', isRoleBased: true, isVerified: false },
                ]
            }
        }
    });

    const lead2 = await prisma.lead.create({
        data: {
            workspaceId: ws.id,
            companyName: 'Acme Corporation',
            website: 'acme.io',
            status: 'NEW',
            industry: 'SaaS',
            location: 'San Francisco, CA',
            contactMethods: {
                create: [
                    { type: 'EMAIL', value: 'hello@acme.io', isRoleBased: true, isVerified: false },
                    { type: 'EMAIL', value: 'sales@acme.io', isRoleBased: true, isVerified: false },
                ]
            }
        }
    });

    const lead3 = await prisma.lead.create({
        data: {
            workspaceId: ws.id,
            companyName: 'Nexus AI',
            website: 'nexus.ai',
            status: 'CONTACTED',
            industry: 'Artificial Intelligence',
            location: 'London, UK',
            contactMethods: {
                create: [
                    { type: 'EMAIL', value: 'contact@nexus.ai', isRoleBased: true, isVerified: true },
                    { type: 'PHONE', value: '+44 20 1234 5678', isRoleBased: false, isVerified: true },
                ]
            }
        }
    });

    const lead4 = await prisma.lead.create({
        data: {
            workspaceId: ws.id,
            companyName: 'TechStart Inc',
            website: 'techstart.com',
            status: 'NEW',
            industry: 'FinTech',
            location: 'Toronto, Canada',
            contactMethods: {
                create: [
                    { type: 'EMAIL', value: 'info@techstart.com', isRoleBased: true, isVerified: false },
                ]
            }
        }
    });

    const lead5 = await prisma.lead.create({
        data: {
            workspaceId: ws.id,
            companyName: 'GreenEnergy Solutions',
            website: 'greenenergy.co',
            status: 'RESEARCHED',
            industry: 'CleanTech',
            location: 'Austin, TX',
            contactMethods: {
                create: [
                    { type: 'EMAIL', value: 'partnerships@greenenergy.co', isRoleBased: true, isVerified: true },
                    { type: 'EMAIL', value: 'press@greenenergy.co', isRoleBased: true, isVerified: false },
                ]
            }
        }
    });

    // Create Campaigns with sequence steps
    const campaign1 = await prisma.campaign.create({
        data: {
            workspaceId: ws.id,
            name: 'Ream Cleaning - South London',
            type: 'REAM_CLEANING',
            status: 'ACTIVE',
            steps: {
                create: [
                    { order: 1, delayDays: 0, subjectTpl: 'Professional Cleaning Services for {{companyName}}', bodyTpl: 'Hi, we offer premium cleaning services...' },
                    { order: 2, delayDays: 3, subjectTpl: 'Following up on our cleaning proposal', bodyTpl: 'Just wanted to check if you had a chance to review...' },
                    { order: 3, delayDays: 7, subjectTpl: 'Special offer for {{companyName}}', bodyTpl: 'We have a limited-time discount available...' },
                ]
            }
        }
    });

    const campaign2 = await prisma.campaign.create({
        data: {
            workspaceId: ws.id,
            name: 'UniDoxia - UK Universities',
            type: 'UNIDOXIA',
            status: 'PAUSED',
            steps: {
                create: [
                    { order: 1, delayDays: 0, subjectTpl: 'Student Document Management Solution', bodyTpl: 'Dear Admissions Team, UniDoxia helps streamline...' },
                    { order: 2, delayDays: 5, subjectTpl: 'Demo of UniDoxia for {{companyName}}', bodyTpl: 'Would you be interested in a quick demo...' },
                ]
            }
        }
    });

    const campaign3 = await prisma.campaign.create({
        data: {
            workspaceId: ws.id,
            name: 'SaaS Outreach Q1 2026',
            type: 'COLD_OUTREACH',
            status: 'DRAFT',
            steps: {
                create: [
                    { order: 1, delayDays: 0, subjectTpl: 'Quick question about {{companyName}}', bodyTpl: 'Hi, I noticed your company is growing...' },
                ]
            }
        }
    });

    // Create some draft emails for the active campaign
    await prisma.draftEmail.createMany({
        data: [
            {
                leadId: lead1.id,
                campaignId: campaign1.id,
                status: 'SENT',
                subject: 'Professional Cleaning Services for Stanford University',
                bodyHtml: '<p>Hi, we offer premium cleaning services...</p>',
                toAddress: 'admissions@stanford.edu'
            },
            {
                leadId: lead2.id,
                campaignId: campaign1.id,
                status: 'APPROVED',
                subject: 'Professional Cleaning Services for Acme Corporation',
                bodyHtml: '<p>Hi, we offer premium cleaning services...</p>',
                toAddress: 'hello@acme.io'
            },
            {
                leadId: lead3.id,
                campaignId: campaign1.id,
                status: 'PENDING_APPROVAL',
                subject: 'Professional Cleaning Services for Nexus AI',
                bodyHtml: '<p>Hi, we offer premium cleaning services...</p>',
                toAddress: 'contact@nexus.ai'
            },
        ]
    });

    return NextResponse.json({ success: true, message: 'Database seeded with sample data' });
}

// GET: Check seed status
export async function GET() {
    const leadCount = await prisma.lead.count();
    const campaignCount = await prisma.campaign.count();
    const contactCount = await prisma.contactMethod.count();

    return NextResponse.json({
        seeded: leadCount > 0,
        counts: {
            leads: leadCount,
            campaigns: campaignCount,
            contacts: contactCount
        }
    });
}

// DELETE: Reset database (for testing)
export async function DELETE() {
    // Delete in order due to foreign keys
    await prisma.complianceNote.deleteMany();
    await prisma.replyEvent.deleteMany();
    await prisma.sendEvent.deleteMany();
    await prisma.approvalItem.deleteMany();
    await prisma.draftEmail.deleteMany();
    await prisma.sequenceStep.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.contactMethod.deleteMany();
    await prisma.sourceUrl.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.optOut.deleteMany();
    await prisma.workspaceMember.deleteMany();
    await prisma.actionLog.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();

    return NextResponse.json({ success: true, message: 'Database reset' });
}
