"use client";

import { useState, useEffect, useCallback } from 'react';

interface Lead {
    id: string;
    companyName: string;
    website: string | null;
    status: string;
    industry: string | null;
    location: string | null;
    createdAt: string;
}

interface DiscoveredLead {
    companyName: string;
    website?: string;
    industry?: string;
    location?: string;
    source: string;
}

export default function IntelligencePage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [discoveredLeads, setDiscoveredLeads] = useState<DiscoveredLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [showDiscovery, setShowDiscovery] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        location: ['North America'],
        industry: [] as string[]
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            if (Array.isArray(data)) {
                setLeads(data);
            }
        } catch (e) {
            console.error('Failed to fetch leads:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDiscoverLeads = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setShowDiscovery(true);

        try {
            const res = await fetch('/api/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: searchQuery,
                    location: searchLocation || undefined,
                    limit: 10
                })
            });

            const data = await res.json();
            if (data.leads) {
                setDiscoveredLeads(data.leads);
            }
        } catch (e) {
            console.error('Discovery failed:', e);
        } finally {
            setSearching(false);
        }
    };

    const handleSaveLeads = async () => {
        setSearching(true);
        try {
            const res = await fetch('/api/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: searchQuery,
                    location: searchLocation || undefined,
                    limit: 10,
                    saveToDb: true
                })
            });

            const data = await res.json();
            if (data.saved > 0) {
                alert(`${data.saved} leads saved to database!`);
                fetchLeads(); // Refresh the leads list
                setShowDiscovery(false);
                setDiscoveredLeads([]);
            } else {
                alert('No new leads to save (may already exist)');
            }
        } catch (e) {
            console.error('Save failed:', e);
        } finally {
            setSearching(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        // Filter by location
        if (selectedFilters.location.length > 0) {
            const hasLocation = selectedFilters.location.some(loc => {
                if (loc === 'North America') {
                    return lead.location?.includes('USA') || lead.location?.includes('Canada') || lead.location?.includes('CA') || lead.location?.includes('TX');
                }
                if (loc === 'Europe') {
                    return lead.location?.includes('UK') || lead.location?.includes('London') || lead.location?.includes('Germany');
                }
                return lead.location?.toLowerCase().includes(loc.toLowerCase());
            });
            if (!hasLocation) return false;
        }

        // Filter by industry
        if (selectedFilters.industry.length > 0) {
            const hasIndustry = selectedFilters.industry.some(ind =>
                lead.industry?.toLowerCase().includes(ind.toLowerCase())
            );
            if (!hasIndustry) return false;
        }

        return true;
    });

    return (
        <div style={{ height: '100%', display: 'flex', gap: '2rem' }}>
            {/* Filters Sidebar */}
            <div style={{ width: '280px', flexShrink: 0 }}>
                <h2 className="h3" style={{ marginBottom: '1.5rem' }}>Parameters</h2>

                {/* Lead Discovery Section */}
                <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 700 }}>🔍 Discover New Leads</h4>
                    <input
                        type="text"
                        placeholder="Search businesses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: 'none',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Location (optional)"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: 'none',
                            marginBottom: '0.75rem',
                            fontSize: '0.875rem'
                        }}
                    />
                    <button
                        onClick={handleDiscoverLeads}
                        disabled={searching || !searchQuery.trim()}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            background: 'white',
                            color: '#764ba2',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: searching || !searchQuery.trim() ? 0.7 : 1
                        }}
                    >
                        {searching ? 'Searching...' : 'Search'}
                    </button>
                </div>

                <div className="filter-group">
                    <label className="text-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Location</label>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <Checkbox
                            label="North America"
                            checked={selectedFilters.location.includes('North America')}
                            onChange={(checked) => {
                                setSelectedFilters(prev => ({
                                    ...prev,
                                    location: checked
                                        ? [...prev.location, 'North America']
                                        : prev.location.filter(l => l !== 'North America')
                                }));
                            }}
                        />
                        <Checkbox
                            label="Europe"
                            checked={selectedFilters.location.includes('Europe')}
                            onChange={(checked) => {
                                setSelectedFilters(prev => ({
                                    ...prev,
                                    location: checked
                                        ? [...prev.location, 'Europe']
                                        : prev.location.filter(l => l !== 'Europe')
                                }));
                            }}
                        />
                        <Checkbox
                            label="Asia-Pacific"
                            checked={selectedFilters.location.includes('Asia-Pacific')}
                            onChange={(checked) => {
                                setSelectedFilters(prev => ({
                                    ...prev,
                                    location: checked
                                        ? [...prev.location, 'Asia-Pacific']
                                        : prev.location.filter(l => l !== 'Asia-Pacific')
                                }));
                            }}
                        />
                    </div>
                </div>

                <div className="filter-group" style={{ marginTop: '2rem' }}>
                    <label className="text-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Industry</label>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <Checkbox
                            label="SaaS"
                            checked={selectedFilters.industry.includes('SaaS')}
                            onChange={(checked) => {
                                setSelectedFilters(prev => ({
                                    ...prev,
                                    industry: checked
                                        ? [...prev.industry, 'SaaS']
                                        : prev.industry.filter(i => i !== 'SaaS')
                                }));
                            }}
                        />
                        <Checkbox
                            label="Education"
                            checked={selectedFilters.industry.includes('Education')}
                            onChange={(checked) => {
                                setSelectedFilters(prev => ({
                                    ...prev,
                                    industry: checked
                                        ? [...prev.industry, 'Education']
                                        : prev.industry.filter(i => i !== 'Education')
                                }));
                            }}
                        />
                        <Checkbox
                            label="FinTech"
                            checked={selectedFilters.industry.includes('FinTech')}
                            onChange={(checked) => {
                                setSelectedFilters(prev => ({
                                    ...prev,
                                    industry: checked
                                        ? [...prev.industry, 'FinTech']
                                        : prev.industry.filter(i => i !== 'FinTech')
                                }));
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
                    <div style={{ fontWeight: 600, color: '#1E40AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>💡 AI Recommendation</div>
                    <p className="text-sm" style={{ color: '#1E40AF', margin: 0 }}>
                        {filteredLeads.length > 0
                            ? `Found ${filteredLeads.length} leads matching your criteria. Consider expanding to Europe for 30% more opportunities.`
                            : 'Try broadening your filters or use the discovery tool to find new leads.'
                        }
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 className="h1">Active Discovery</h1>
                        <p className="text-sm">Showing {filteredLeads.length} qualified leads from your database</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-secondary">Export</button>
                        <button className="btn btn-secondary">Columns</button>
                    </div>
                </div>

                {/* Discovery Results Panel */}
                {showDiscovery && (
                    <div className="card" style={{ marginBottom: '1.5rem', background: '#FEFCE8', border: '1px solid #FEF08A' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h3 className="h3" style={{ margin: 0, color: '#854D0E' }}>Discovery Results</h3>
                                <p className="text-sm" style={{ margin: '0.25rem 0 0 0', color: '#A16207' }}>
                                    Found {discoveredLeads.length} potential leads for "{searchQuery}"
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveLeads}
                                    disabled={searching || discoveredLeads.length === 0}
                                >
                                    {searching ? 'Saving...' : 'Save to Database'}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => { setShowDiscovery(false); setDiscoveredLeads([]); }}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>

                        {discoveredLeads.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                                {discoveredLeads.map((lead, index) => (
                                    <div key={index} style={{
                                        padding: '0.75rem',
                                        background: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #E5E7EB'
                                    }}>
                                        <div style={{ fontWeight: 600 }}>{lead.companyName}</div>
                                        <div className="text-sm">{lead.industry || 'Business'}</div>
                                        {lead.location && <div className="text-sm">📍 {lead.location}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Leads Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading leads...</div>
                    ) : filteredLeads.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                            <h3 className="h3">No leads found</h3>
                            <p className="text-sm">Try adjusting your filters or discover new leads using the search tool.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Company</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Industry</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Location</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Website</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }} className="text-label">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map(lead => (
                                    <tr key={lead.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{lead.companyName}</td>
                                        <td style={{ padding: '1rem', color: '#6B7280' }}>{lead.industry || '—'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {getLocationFlag(lead.location)}
                                                {lead.location || '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--accent)' }}>
                                            {lead.website ? (
                                                <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer">
                                                    {lead.website}
                                                </a>
                                            ) : '—'}
                                        </td>
                                        <td style={{ padding: '1rem' }}><StatusBadge status={lead.status} /></td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <a
                                                    href={`/leads/${lead.id}`}
                                                    className="btn btn-ghost"
                                                    style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none', padding: '4px 8px' }}
                                                >
                                                    Inspect
                                                </a>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                    onClick={() => alert(`Would generate email draft for ${lead.companyName}`)}
                                                >
                                                    Draft Email
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function Checkbox({ label, checked, onChange }: { label: string; checked?: boolean; onChange?: (checked: boolean) => void }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>{label}</span>
        </label>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, { bg: string; color: string }> = {
        NEW: { bg: '#ECFDF5', color: '#059669' },
        RESEARCHED: { bg: '#DBEAFE', color: '#2563EB' },
        DRAFTED: { bg: '#FEF3C7', color: '#D97706' },
        APPROVED: { bg: '#D1FAE5', color: '#059669' },
        SENT: { bg: '#E0E7FF', color: '#4F46E5' },
        REPLIED: { bg: '#FCE7F3', color: '#DB2777' },
        BOOKED: { bg: '#CFFAFE', color: '#0891B2' },
        CONTACTED: { bg: '#EFF6FF', color: '#2563EB' },
    };
    const s = styles[status] || styles.NEW;
    return (
        <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
            {status}
        </span>
    );
}

function getLocationFlag(location: string | null): string {
    if (!location) return '';
    const loc = location.toLowerCase();
    if (loc.includes('usa') || loc.includes('san francisco') || loc.includes('new york') || loc.includes('austin') || loc.includes('ca') || loc.includes('tx')) return '🇺🇸';
    if (loc.includes('uk') || loc.includes('london')) return '🇬🇧';
    if (loc.includes('germany') || loc.includes('berlin')) return '🇩🇪';
    if (loc.includes('canada') || loc.includes('toronto')) return '🇨🇦';
    return '🌍';
}
