import { prisma } from '@outreach/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch single campaign by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                workspace: true,
                steps: {
                    orderBy: { order: 'asc' }
                },
                drafts: {
                    include: {
                        lead: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Calculate stats
        const totalDrafts = campaign.drafts.length;
        const sentDrafts = campaign.drafts.filter(d => d.status === 'SENT').length;
        const approvedDrafts = campaign.drafts.filter(d => d.status === 'APPROVED').length;
        const pendingDrafts = campaign.drafts.filter(d => d.status === 'PENDING_APPROVAL').length;

        return NextResponse.json({
            ...campaign,
            stats: {
                totalDrafts,
                sentDrafts,
                approvedDrafts,
                pendingDrafts,
                progress: totalDrafts > 0 ? Math.round((sentDrafts / totalDrafts) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Failed to fetch campaign:', error);
        return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
    }
}

// PUT: Update campaign
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, type, status } = body;

        const campaign = await prisma.campaign.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(status && { status }),
            }
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Failed to update campaign:', error);
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }
}

// DELETE: Remove campaign
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete related records first
        await prisma.sequenceStep.deleteMany({ where: { campaignId: id } });
        await prisma.draftEmail.deleteMany({ where: { campaignId: id } });

        await prisma.campaign.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete campaign:', error);
        return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
    }
}
