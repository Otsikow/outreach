import { prisma } from '@outreach/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: List all campaigns with stats
export async function GET() {
    try {
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                workspace: true,
                drafts: {
                    select: {
                        id: true,
                        status: true
                    }
                }
            }
        });

        // Transform for frontend with calculated stats
        const formatted = campaigns.map(c => {
            const totalDrafts = c.drafts.length;
            const sentDrafts = c.drafts.filter(d => d.status === 'SENT').length;
            const progress = totalDrafts > 0 ? Math.round((sentDrafts / totalDrafts) * 100) : 0;

            return {
                id: c.id,
                name: c.name,
                type: c.type,
                status: c.status,
                createdAt: c.createdAt,
                progress,
                leads: totalDrafts
            };
        });

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new campaign
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, type, workspaceId } = body;

        // Get or create workspace
        let targetWorkspaceId = workspaceId;
        if (!targetWorkspaceId) {
            let ws = await prisma.workspace.findFirst();
            if (!ws) {
                ws = await prisma.workspace.create({
                    data: { name: 'Default Workspace' }
                });
            }
            targetWorkspaceId = ws.id;
        }

        const campaign = await prisma.campaign.create({
            data: {
                name,
                type,
                workspaceId: targetWorkspaceId,
                status: 'DRAFT'
            }
        });

        return NextResponse.json({
            ...campaign,
            progress: 0,
            leads: 0
        });
    } catch (error) {
        console.error('Failed to create campaign:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
