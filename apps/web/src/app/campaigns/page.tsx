"use client";

import { useState, useEffect } from 'react';
import CreateCampaignModal from '@/components/CreateCampaignModal';

export default function CampaignsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/campaigns');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCampaigns(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Attempt to seed first (demo hack)
        fetch('/api/seed', { method: 'POST' }).finally(() => {
            fetchCampaigns();
        });
    }, []);

    const handleSave_DB = async (campaignData: any) => {
        // Optimistic
        const tempId = Math.random().toString();
        const pData = { ...campaignData, id: tempId, status: 'DRAFT', progress: 0, leads: 0 };
        setCampaigns([pData, ...campaigns]);

        // Real Save
        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaignData)
            });
            if (res.ok) {
                fetchCampaigns(); // Refresh real IDs
            }
        } catch (e) {
            alert('Failed to save to DB');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="h1">Campaigns</h1>
                    <p className="text-sm">Manage your active outreach operations (Database Connected).</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    + New Campaign
                </button>
            </div>

            {loading ? (
                <div>Loading campaigns from database...</div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {campaigns.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>No campaigns found. Create one to get started.</div>}

                    {campaigns.map(c => (
                        <div key={c.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    background: '#F3F4F6', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem'
                                }}>
                                    {c.type === 'REAM_CLEANING' || c.type?.includes('Ream') ? '🧹' : '🎓'}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <h3 className="h3" style={{ margin: 0, fontSize: '1.1rem' }}>{c.name}</h3>
                                        <Badge status={c.status} />
                                    </div>
                                    <p className="text-sm" style={{ marginTop: '0.25rem', marginBottom: 0 }}>
                                        {c.type} • {c.leads > 0 ? `${c.leads} Leads targeted` : 'No leads yet'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="text-label">Health</div>
                                    {c.status === 'ACTIVE' && <div style={{ fontWeight: 600, color: 'var(--success)' }}>Optimal</div>}
                                    {c.status === 'PAUSED' && <div style={{ fontWeight: 600, color: 'var(--warning)' }}>Paused</div>}
                                    {c.status === 'DRAFT' && <div style={{ fontWeight: 600, color: '#9CA3AF' }}>Setup</div>}
                                </div>

                                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                    <div className="text-label">Progress</div>
                                    <div style={{ fontWeight: 600 }}>{c.progress || 0}%</div>
                                    <div style={{ width: '100%', height: '4px', background: '#F3F4F6', marginTop: '4px', borderRadius: '2px' }}>
                                        <div style={{ width: `${c.progress || 0}%`, height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <a href={`/campaigns/${c.id}`} className="btn btn-secondary">
                                        Manage
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateCampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave_DB}
            />
        </div>
    );
}

function Badge({ status }: { status: string }) {
    const colors: any = {
        ACTIVE: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' },
        PAUSED: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' },
        DRAFT: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' },
    };
    const style = colors[status] || colors.DRAFT;

    return (
        <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            background: style.bg,
            color: style.color,
            padding: '2px 8px',
            borderRadius: '4px'
        }}>
            {status}
        </span>
    );
}
