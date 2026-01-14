// Lead Discovery Service
// Provides search functionality using available APIs

export interface SearchFilters {
    query: string;
    location?: string;
    industry?: string;
    limit?: number;
}

export interface DiscoveredLead {
    companyName: string;
    website?: string;
    industry?: string;
    location?: string;
    placeId?: string;
    address?: string;
    phone?: string;
    rating?: number;
    source: 'GOOGLE_PLACES' | 'FIRECRAWL' | 'MANUAL';
}

// Search leads using Google Places API (when configured)
export async function searchGooglePlaces(
    query: string,
    location?: string,
    apiKey?: string
): Promise<DiscoveredLead[]> {
    if (!apiKey) {
        console.log('Google Places API key not configured, returning mock data');
        return getMockLeads(query, location);
    }

    try {
        // Text search for businesses
        const searchQuery = location ? `${query} in ${location}` : query;
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            console.error('Google Places API error:', data.status);
            return getMockLeads(query, location);
        }

        return data.results.map((place: any) => ({
            companyName: place.name,
            website: null, // Would need Place Details API call
            industry: place.types?.[0]?.replace(/_/g, ' '),
            location: place.formatted_address,
            placeId: place.place_id,
            address: place.formatted_address,
            rating: place.rating,
            source: 'GOOGLE_PLACES' as const
        }));
    } catch (error) {
        console.error('Error searching Google Places:', error);
        return getMockLeads(query, location);
    }
}

// Extract emails from website using Firecrawl (when configured)
export async function extractEmailsFromWebsite(
    url: string,
    apiKey?: string
): Promise<string[]> {
    if (!apiKey) {
        console.log('Firecrawl API key not configured');
        return [];
    }

    try {
        const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                url,
                pageOptions: {
                    onlyMainContent: false
                }
            })
        });

        const data = await response.json();

        // Extract emails from the scraped content
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const content = data.content || '';
        const emails = content.match(emailRegex) || [];

        // Filter out common non-business emails
        const filteredEmails = emails.filter((email: string) => {
            const lower = email.toLowerCase();
            return !lower.includes('example.com') &&
                !lower.includes('gmail.com') &&
                !lower.includes('test.com');
        });

        return [...new Set(filteredEmails)];
    } catch (error) {
        console.error('Error extracting emails:', error);
        return [];
    }
}

// Verify email using Hunter API (when configured)
export async function verifyEmail(
    email: string,
    apiKey?: string
): Promise<{ valid: boolean; confidence: number; sources?: string[] }> {
    if (!apiKey) {
        // Basic validation without API
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        return { valid: isValid, confidence: isValid ? 60 : 0 };
    }

    try {
        const response = await fetch(
            `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`
        );
        const data = await response.json();

        return {
            valid: data.data?.result === 'deliverable',
            confidence: data.data?.score || 0,
            sources: data.data?.sources?.map((s: any) => s.domain)
        };
    } catch (error) {
        console.error('Error verifying email:', error);
        return { valid: true, confidence: 50 };
    }
}

// Find emails for a domain using Hunter
export async function findEmailsForDomain(
    domain: string,
    apiKey?: string
): Promise<string[]> {
    if (!apiKey) {
        // Return common pattern emails
        return [
            `info@${domain}`,
            `contact@${domain}`,
            `hello@${domain}`
        ];
    }

    try {
        const response = await fetch(
            `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}`
        );
        const data = await response.json();

        return data.data?.emails?.map((e: any) => e.value) || [];
    } catch (error) {
        console.error('Error finding emails:', error);
        return [];
    }
}

// Mock data for development
function getMockLeads(query: string, location?: string): DiscoveredLead[] {
    const mockCompanies = [
        {
            companyName: 'TechStart Solutions',
            website: 'techstart.com',
            industry: 'Technology',
            location: location || 'San Francisco, CA',
            source: 'GOOGLE_PLACES' as const
        },
        {
            companyName: 'Innovation Labs Inc',
            website: 'innovationlabs.io',
            industry: 'Software',
            location: location || 'Austin, TX',
            source: 'GOOGLE_PLACES' as const
        },
        {
            companyName: 'Digital Marketing Pro',
            website: 'digitalmarketingpro.com',
            industry: 'Marketing',
            location: location || 'New York, NY',
            source: 'GOOGLE_PLACES' as const
        },
        {
            companyName: 'CloudSync Technologies',
            website: 'cloudsync.tech',
            industry: 'Cloud Computing',
            location: location || 'Seattle, WA',
            source: 'GOOGLE_PLACES' as const
        },
        {
            companyName: 'GreenEnergy Solutions',
            website: 'greenenergy.co',
            industry: 'Clean Energy',
            location: location || 'Denver, CO',
            source: 'GOOGLE_PLACES' as const
        }
    ];

    // Filter based on query if provided
    if (query) {
        return mockCompanies.filter(c =>
            c.companyName.toLowerCase().includes(query.toLowerCase()) ||
            c.industry.toLowerCase().includes(query.toLowerCase())
        );
    }

    return mockCompanies;
}

// Comprehensive lead search combining multiple sources
export async function discoverLeads(
    filters: SearchFilters,
    config: {
        googleApiKey?: string;
        hunterApiKey?: string;
        firecrawlApiKey?: string;
    }
): Promise<DiscoveredLead[]> {
    const results: DiscoveredLead[] = [];

    // Search Google Places
    const placesResults = await searchGooglePlaces(
        filters.query,
        filters.location,
        config.googleApiKey
    );
    results.push(...placesResults);

    // For each result with a website, try to find emails
    for (const lead of results.slice(0, 5)) { // Limit to first 5 to avoid rate limiting
        if (lead.website && config.hunterApiKey) {
            const emails = await findEmailsForDomain(lead.website, config.hunterApiKey);
            if (emails.length > 0) {
                // Store emails with lead (would be done via separate endpoint)
                console.log(`Found ${emails.length} emails for ${lead.companyName}`);
            }
        }
    }

    return results.slice(0, filters.limit || 20);
}
