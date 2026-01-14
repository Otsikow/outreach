// apps/web/src/lib/playbooks.ts

export interface Playbook {
    id: string;
    name: string;
    description: string;
    type: 'REAM_CLEANING' | 'UNIDOXIA';
    icon: string;
}

export const PLAYBOOKS: Playbook[] = [
    {
        id: 'ream-cleaning',
        name: 'Ream Cleaning Services',
        description: 'Local B2B outreach to offices, clinics, and estate agents.',
        type: 'REAM_CLEANING',
        icon: '🧹' // Using emoji for now to avoid icon lib dependency bloat
    },
    {
        id: 'unidoxia',
        name: 'UniDoxia University Partnerships',
        description: 'High-touch partnership outreach to International Offices.',
        type: 'UNIDOXIA',
        icon: '🎓'
    }
];

export function generateTemplates(type: string, variables: any) {
    if (type === 'REAM_CLEANING') {
        const city = variables.city || '[City]';
        return [
            {
                subject: `Commercial cleaning for {company_name}`,
                body: `Hi,<br/><br/>I run Ream Cleaning Services locally. We ensure offices like {company_name} in ${city} are spotless for clients and staff.<br/><br/>We offer:<br/>- DBS-trained staff<br/>- Out-of-hours service<br/>- Competitive rates<br/><br/>Can I pop by for a 10-min site visit quote next week?<br/><br/>Best,<br/>Eric`
            },
            {
                subject: `${city} office cleaning quote`,
                body: `Hello,<br/><br/>Are you currently happy with the cleaning standards at {company_name}?<br/><br/>Ream Cleaning specializes in commercial spaces in ${city}. We focus on reliability and high standards.<br/><br/>Reply 'YES' for a quick quote.<br/><br/>Thanks,<br/>Eric`
            }
        ];
    }

    if (type === 'UNIDOXIA') {
        const region = variables.region || 'Africa';
        return [
            {
                subject: `Student recruitment partnership - {university_name}`,
                body: `Dear International Team,<br/><br/>UniDoxia helps universities like {university_name} build a reliable pipeline of qualified students from ${region}.<br/><br/>We handle document pre-checks and agent management, ensuring you get high-conversion applicants.<br/><br/>Would you be open to a brief call to discuss a partnership?<br/><br/>Best regards,<br/>UniDoxia Partnerships`
            },
            {
                subject: `Increasing {university_name}'s reach in ${region}`,
                body: `Hi there,<br/><br/>I'm reaching out from UniDoxia regarding your international recruitment strategy.<br/><br/>We have a strong network in ${region} and would love to feature {university_name} in our upcoming pilot program.<br/><br/>Can we schedule a 15-min chat?<br/><br/>Best,<br/>UniDoxia Team`
            }
        ];
    }

    return [];
}
