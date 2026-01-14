import { prisma } from '@outreach/db';
import { NextRequest, NextResponse } from 'next/server';
import { discoverLeads } from '@/lib/discovery';

// POST: Search/discover new leads
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, location, industry, limit = 10, saveToDb = false } = body;

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Get API keys from environment (will be undefined if not set)
        const config = {
            googleApiKey: process.env.GOOGLE_MAPS_API_KEY,
            hunterApiKey: process.env.HUNTER_API_KEY,
            firecrawlApiKey: process.env.FIRECRAWL_API_KEY
        };

        // Discover leads
        const discoveredLeads = await discoverLeads(
            { query, location, industry, limit },
            config
        );

        // Optionally save to database
        if (saveToDb && discoveredLeads.length > 0) {
            // Get or create workspace
            let ws = await prisma.workspace.findFirst();
            if (!ws) {
                ws = await prisma.workspace.create({
                    data: { name: 'Default Workspace' }
                });
            }

            // Save leads that don't already exist
            const savedLeads = [];
            for (const lead of discoveredLeads) {
                const existing = await prisma.lead.findFirst({
                    where: {
                        OR: [
                            { companyName: lead.companyName },
                            ...(lead.website ? [{ website: lead.website }] : [])
                        ]
                    }
                });

                if (!existing) {
                    const savedLead = await prisma.lead.create({
                        data: {
                            workspaceId: ws.id,
                            companyName: lead.companyName,
                            website: lead.website,
                            industry: lead.industry,
                            location: lead.location,
                            placeId: lead.placeId,
                            status: 'NEW'
                        }
                    });
                    savedLeads.push(savedLead);
                }
            }

            return NextResponse.json({
                discovered: discoveredLeads.length,
                saved: savedLeads.length,
                leads: savedLeads
            });
        }

        return NextResponse.json({
            discovered: discoveredLeads.length,
            leads: discoveredLeads
        });
    } catch (error) {
        console.error('Lead discovery error:', error);
        return NextResponse.json({ error: 'Discovery failed' }, { status: 500 });
    }
}
