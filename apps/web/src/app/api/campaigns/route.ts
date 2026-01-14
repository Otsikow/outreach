import { prisma } from '@outreach/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: List all campaigns
export async function GET() {
    try {
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                workspace: true
            }
        });

        // Transform for frontend
        const formatted = campaigns.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            status: c.status,
            progress: 0, // Calculate based on sends?
            leads: 0 // Calculate based on relation?
        }));

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

        // TODO: Get real workspace ID from auth session
        // For MVP, if no workspace exists, create one or use the first one
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

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Failed to create campaign:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
