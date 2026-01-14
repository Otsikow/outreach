export const WORKSPACE_ROLES = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
} as const;

export const CAMPAIGN_STATUS = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED',
} as const;

export const LEAD_STATUS = {
    NEW: 'NEW',
    RESEARCHED: 'RESEARCHED',
    DRAFTED: 'DRAFTED',
    APPROVED: 'APPROVED',
    SENT: 'SENT',
    REPLIED: 'REPLIED',
    BOOKED: 'BOOKED',
    CLOSED_WON: 'CLOSED_WON',
    OPTED_OUT: 'OPTED_OUT',
    UNQUALIFIED: 'UNQUALIFIED',
} as const;
