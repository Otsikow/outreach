import { prisma } from '@outreach/db';
import { NextRequest, NextResponse } from 'next/server';

// SEED / RESET Route (For demo purposes)
export async function POST() {
    // Check if we have data
    const count = await prisma.lead.count();
    if (count > 0) return NextResponse.json({ msg: 'Already seeded' });

    // Create Workspace
    const ws = await prisma.workspace.create({
        data: { name: 'Main Workspace' }
    });

    // Create Leads
    await prisma.lead.createMany({
        data: [
            { workspaceId: ws.id, companyName: 'Acme Corp', website: 'acme.io', status: 'NEW', industry: 'SaaS', location: 'USA' },
            { workspaceId: ws.id, companyName: 'Stanford University', website: 'stanford.edu', status: 'RESEARCHED', industry: 'Education', location: 'USA' },
            { workspaceId: ws.id, companyName: 'Nexus AI', website: 'nexus.ai', status: 'CONTACTED', industry: 'AI', location: 'UK' },
        ]
    });

    // Create Campaigns
    await prisma.campaign.createMany({
        data: [
            { workspaceId: ws.id, name: 'Ream Cleaning - South London', type: 'REAM_CLEANING', status: 'ACTIVE' },
            { workspaceId: ws.id, name: 'UniDoxia - UK Universities', type: 'UNIDOXIA', status: 'PAUSED' }
        ]
    });

    return NextResponse.json({ success: true });
}
