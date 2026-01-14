"use client";

import { useState, useEffect } from 'react';

interface Lead {
    id: string;
    companyName: string;
    website: string | null;
    status: string;
    industry: string | null;
    location: string | null;
    contactMethods: ContactMethod[];
}

interface ContactMethod {
    id: string;
    type: string;
    value: string;
    isVerified: boolean;
}

interface Campaign {
    id: string;
    name: string;
    type: string;
    status: string;
}

interface DraftEmail {
    id: string;
    subject: string;
    bodyHtml: string;
    toAddress: string;
    status: string;
    lead: Lead;
    campaign: Campaign;
    createdAt: string;
}

export default function ComposePage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [drafts, setDrafts] = useState<DraftEmail[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [currentDraft, setCurrentDraft] = useState<DraftEmail | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [leadsRes, campaignsRes, draftsRes] = await Promise.all([
                fetch('/api/leads'),
                fetch('/api/campaigns'),
                fetch('/api/emails')
            ]);

            const [leadsData, campaignsData, draftsData] = await Promise.all([
                leadsRes.json(),
                campaignsRes.json(),
                draftsRes.json()
            ]);

            if (Array.isArray(leadsData)) setLeads(leadsData);
            if (Array.isArray(campaignsData)) setCampaigns(campaignsData);
            if (Array.isArray(draftsData)) setDrafts(draftsData);
        } catch (e) {
            console.error('Failed to fetch data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateDraft = async () => {
        if (!selectedLead || !selectedCampaign) {
            alert('Please select a lead and campaign first');
            return;
        }

        setGenerating(true);
        try {
            const res = await fetch('/api/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadId: selectedLead.id,
                    campaignId: selectedCampaign.id
                })
            });

            const data = await res.json();
            if (data.id) {
                setCurrentDraft(data);
                setEditSubject(data.subject);
                setEditBody(data.bodyHtml);
                fetchData(); // Refresh drafts list
            }
        } catch (e) {
            console.error('Failed to generate draft:', e);
            alert('Failed to generate email draft');
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!currentDraft) return;

        try {
            const res = await fetch('/api/emails', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: currentDraft.id,
                    subject: editSubject,
                    bodyHtml: editBody
                })
            });

            if (res.ok) {
                setEditMode(false);
                fetchData();
                const data = await res.json();
                setCurrentDraft(prev => prev ? { ...prev, subject: editSubject, bodyHtml: editBody } : null);
            }
        } catch (e) {
            console.error('Failed to save draft:', e);
        }
    };

    const handleAction = async (action: 'approve' | 'reject' | 'send') => {
        if (!currentDraft) return;

        setSending(action === 'send');
        try {
            const res = await fetch('/api/emails', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: currentDraft.id,
                    action
                })
            });

            const data = await res.json();
            if (data.success || data.status) {
                if (action === 'send') {
                    alert(`Email sent successfully! Message ID: ${data.messageId}`);
                } else {
                    alert(`Email ${action}d successfully!`);
                }
                fetchData();
                setCurrentDraft(null);
            } else if (data.error) {
                alert(`Failed: ${data.error}`);
            }
        } catch (e) {
            console.error(`Failed to ${action}:`, e);
        } finally {
            setSending(false);
        }
    };

    const pendingDrafts = drafts.filter(d => d.status === 'DRAFT' || d.status === 'PENDING_APPROVAL');
    const approvedDrafts = drafts.filter(d => d.status === 'APPROVED');
    const sentDrafts = drafts.filter(d => d.status === 'SENT');

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '1.5rem', height: '100%' }}>
            {/* Left Panel - Lead & Campaign Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card">
                    <h3 className="h3" style={{ marginBottom: '1rem' }}>1. Select Lead</h3>
                    <select
                        className="input"
                        style={{ width: '100%', padding: '0.5rem' }}
                        value={selectedLead?.id || ''}
                        onChange={(e) => {
                            const lead = leads.find(l => l.id === e.target.value);
                            setSelectedLead(lead || null);
                        }}
                    >
                        <option value="">Choose a lead...</option>
                        {leads.map(lead => (
                            <option key={lead.id} value={lead.id}>
                                {lead.companyName}
                            </option>
                        ))}
                    </select>

                    {selectedLead && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F9FAFB', borderRadius: '6px' }}>
                            <div style={{ fontWeight: 600 }}>{selectedLead.companyName}</div>
                            <div className="text-sm">{selectedLead.industry}</div>
                            <div className="text-sm">{selectedLead.location}</div>
                            {selectedLead.contactMethods?.length > 0 && (
                                <div className="text-sm" style={{ marginTop: '0.5rem', color: 'var(--accent)' }}>
                                    ✉️ {selectedLead.contactMethods[0].value}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3 className="h3" style={{ marginBottom: '1rem' }}>2. Select Campaign</h3>
                    <select
                        className="input"
                        style={{ width: '100%', padding: '0.5rem' }}
                        value={selectedCampaign?.id || ''}
                        onChange={(e) => {
                            const campaign = campaigns.find(c => c.id === e.target.value);
                            setSelectedCampaign(campaign || null);
                        }}
                    >
                        <option value="">Choose a campaign...</option>
                        {campaigns.map(campaign => (
                            <option key={campaign.id} value={campaign.id}>
                                {campaign.name} ({campaign.type})
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleGenerateDraft}
                    disabled={generating || !selectedLead || !selectedCampaign}
                    style={{ marginTop: 'auto' }}
                >
                    {generating ? '✨ Generating...' : '✨ Generate Email Draft'}
                </button>
            </div>

            {/* Center Panel - Email Composer */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Email Composer</h2>

                {!currentDraft ? (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6B7280',
                        textAlign: 'center',
                        padding: '2rem'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
                        <h3 className="h3" style={{ color: '#374151' }}>No Draft Selected</h3>
                        <p className="text-sm">Select a lead and campaign, then click "Generate Email Draft" to create a personalized email.</p>
                        <p className="text-sm" style={{ marginTop: '1rem' }}>Or select an existing draft from the right panel.</p>
                    </div>
                ) : (
                    <>
                        {/* To Address */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="text-label">To:</label>
                            <div style={{ padding: '0.5rem', background: '#F9FAFB', borderRadius: '4px', marginTop: '0.25rem' }}>
                                {currentDraft.toAddress}
                            </div>
                        </div>

                        {/* Subject */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="text-label">Subject:</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    className="input"
                                    value={editSubject}
                                    onChange={(e) => setEditSubject(e.target.value)}
                                    style={{ width: '100%', marginTop: '0.25rem' }}
                                />
                            ) : (
                                <div style={{ padding: '0.5rem', background: '#F9FAFB', borderRadius: '4px', marginTop: '0.25rem', fontWeight: 500 }}>
                                    {currentDraft.subject}
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1, marginBottom: '1rem' }}>
                            <label className="text-label">Body:</label>
                            {editMode ? (
                                <textarea
                                    className="input"
                                    value={editBody}
                                    onChange={(e) => setEditBody(e.target.value)}
                                    style={{ width: '100%', height: '300px', marginTop: '0.25rem', fontFamily: 'inherit' }}
                                />
                            ) : (
                                <div
                                    style={{
                                        padding: '1rem',
                                        background: 'white',
                                        border: '1px solid var(--border)',
                                        borderRadius: '4px',
                                        marginTop: '0.25rem',
                                        maxHeight: '400px',
                                        overflow: 'auto'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: currentDraft.bodyHtml }}
                                />
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            {editMode ? (
                                <>
                                    <button className="btn btn-primary" onClick={handleSaveDraft}>
                                        Save Changes
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => {
                                        setEditMode(false);
                                        setEditSubject(currentDraft.subject);
                                        setEditBody(currentDraft.bodyHtml);
                                    }}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-secondary" onClick={() => setEditMode(true)}>
                                        ✏️ Edit
                                    </button>
                                    {currentDraft.status !== 'APPROVED' && (
                                        <button className="btn btn-success-soft" onClick={() => handleAction('approve')}>
                                            ✓ Approve
                                        </button>
                                    )}
                                    {currentDraft.status !== 'REJECTED' && (
                                        <button className="btn btn-danger-soft" onClick={() => handleAction('reject')}>
                                            ✗ Reject
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleAction('send')}
                                        disabled={sending}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        {sending ? 'Sending...' : '🚀 Send Email'}
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Right Panel - Drafts Queue */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 className="h3" style={{ marginBottom: '1rem' }}>Draft Queue</h3>

                    {/* Pending */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div className="text-label" style={{ marginBottom: '0.5rem' }}>Pending Review ({pendingDrafts.length})</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflow: 'auto' }}>
                            {pendingDrafts.length === 0 ? (
                                <div className="text-sm" style={{ color: '#9CA3AF' }}>No pending drafts</div>
                            ) : (
                                pendingDrafts.map(draft => (
                                    <DraftCard
                                        key={draft.id}
                                        draft={draft}
                                        isSelected={currentDraft?.id === draft.id}
                                        onClick={() => {
                                            setCurrentDraft(draft);
                                            setEditSubject(draft.subject);
                                            setEditBody(draft.bodyHtml);
                                            setEditMode(false);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Approved */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div className="text-label" style={{ marginBottom: '0.5rem' }}>Ready to Send ({approvedDrafts.length})</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflow: 'auto' }}>
                            {approvedDrafts.length === 0 ? (
                                <div className="text-sm" style={{ color: '#9CA3AF' }}>No approved drafts</div>
                            ) : (
                                approvedDrafts.map(draft => (
                                    <DraftCard
                                        key={draft.id}
                                        draft={draft}
                                        isSelected={currentDraft?.id === draft.id}
                                        onClick={() => {
                                            setCurrentDraft(draft);
                                            setEditSubject(draft.subject);
                                            setEditBody(draft.bodyHtml);
                                            setEditMode(false);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sent */}
                    <div>
                        <div className="text-label" style={{ marginBottom: '0.5rem' }}>Recently Sent ({sentDrafts.length})</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflow: 'auto' }}>
                            {sentDrafts.length === 0 ? (
                                <div className="text-sm" style={{ color: '#9CA3AF' }}>No sent emails yet</div>
                            ) : (
                                sentDrafts.slice(0, 5).map(draft => (
                                    <DraftCard
                                        key={draft.id}
                                        draft={draft}
                                        isSelected={currentDraft?.id === draft.id}
                                        onClick={() => {
                                            setCurrentDraft(draft);
                                            setEditSubject(draft.subject);
                                            setEditBody(draft.bodyHtml);
                                            setEditMode(false);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DraftCard({ draft, isSelected, onClick }: { draft: DraftEmail; isSelected: boolean; onClick: () => void }) {
    const statusColors: Record<string, string> = {
        DRAFT: '#6B7280',
        PENDING_APPROVAL: '#D97706',
        APPROVED: '#059669',
        REJECTED: '#DC2626',
        SENT: '#2563EB'
    };

    return (
        <div
            onClick={onClick}
            style={{
                padding: '0.5rem',
                background: isSelected ? '#EFF6FF' : '#F9FAFB',
                borderRadius: '4px',
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                transition: 'all 0.15s'
            }}
        >
            <div style={{ fontWeight: 500, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {draft.lead?.companyName || 'Unknown Lead'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <div className="text-sm" style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                    {draft.toAddress.substring(0, 20)}...
                </div>
                <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: statusColors[draft.status] || '#6B7280'
                }}>
                    {draft.status}
                </span>
            </div>
        </div>
    );
}
