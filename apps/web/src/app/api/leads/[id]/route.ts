import { prisma } from '@outreach/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch single lead by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                contactMethods: {
                    include: {
                        sourceUrl: true,
                    }
                },
                drafts: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                approvals: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json(lead);
    } catch (error) {
        console.error('Failed to fetch lead:', error);
        return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
    }
}

// PUT: Update lead
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { companyName, website, industry, location, status } = body;

        const lead = await prisma.lead.update({
            where: { id },
            data: {
                ...(companyName && { companyName }),
                ...(website && { website }),
                ...(industry && { industry }),
                ...(location && { location }),
                ...(status && { status }),
            }
        });

        return NextResponse.json(lead);
    } catch (error) {
        console.error('Failed to update lead:', error);
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }
}

// DELETE: Remove lead
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete related records first
        await prisma.contactMethod.deleteMany({ where: { leadId: id } });
        await prisma.approvalItem.deleteMany({ where: { leadId: id } });
        await prisma.draftEmail.deleteMany({ where: { leadId: id } });

        await prisma.lead.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete lead:', error);
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
}
