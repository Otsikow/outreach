import { prisma } from '@outreach/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: List all leads with search and filtering
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { companyName: { contains: search, mode: 'insensitive' } },
                { website: { contains: search, mode: 'insensitive' } },
                { industry: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ];
        }

        const leads = await prisma.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                contactMethods: true,
            }
        });

        return NextResponse.json(leads);
    } catch (error) {
        console.error('Failed to fetch leads:', error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}

// POST: Create a new lead
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { companyName, website, industry, location, email } = body;

        // Get or create default workspace
        let ws = await prisma.workspace.findFirst();
        if (!ws) {
            ws = await prisma.workspace.create({
                data: { name: 'Default Workspace' }
            });
        }

        // Create lead
        const lead = await prisma.lead.create({
            data: {
                workspaceId: ws.id,
                companyName,
                website,
                industry,
                location,
                status: 'NEW'
            }
        });

        // If email provided, create contact method
        if (email) {
            await prisma.contactMethod.create({
                data: {
                    leadId: lead.id,
                    type: 'EMAIL',
                    value: email,
                    isRoleBased: email.startsWith('info@') || email.startsWith('contact@') || email.startsWith('admin@'),
                    isVerified: false
                }
            });
        }

        return NextResponse.json(lead);
    } catch (error) {
        console.error('Failed to create lead:', error);
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}
