"use client";

import { useParams } from 'next/navigation';

export default function LeadDetailPage() {
    const params = useParams();
    const id = params.id;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <a href="/leads" className="text-sm" style={{ hover: { textDecoration: 'underline' } }}>← Back to Leads</a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '64px', height: '64px', background: '#E5E7EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        👤
                    </div>
                    <div>
                        <h1 className="h1" style={{ margin: 0, fontSize: '1.5rem' }}>Lead #{id}</h1>
                        <p className="text-sm">Vice President of Engineering @ Tech Corp</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary">Edit Profile</button>
                    <button className="btn btn-primary" onClick={() => window.open(`mailto:lead${id}@example.com`)}>Send Email</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.5rem' }}>
                <div className="card">
                    <h3 className="h3">Contact Information</h3>
                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <div className="text-label">Email</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <span style={{ fontWeight: 500 }}>lead{id}@example.com</span>
                                <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>VERIFIED</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-label">Phone</div>
                            <div style={{ marginTop: '0.25rem' }}>+1 (555) 000-0000</div>
                        </div>
                        <div>
                            <div className="text-label">LinkedIn</div>
                            <a href="#" style={{ color: 'var(--accent)', marginTop: '0.25rem', display: 'block' }}>linkedin.com/in/lead{id}</a>
                        </div>
                        <div>
                            <div className="text-label">Location</div>
                            <div style={{ marginTop: '0.25rem' }}>San Francisco, CA</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h3 className="h3" style={{ fontSize: '1rem' }}>Notes</h3>
                        <textarea className="input" style={{ width: '100%', marginTop: '0.5rem', minHeight: '100px' }} placeholder="Add notes about this lead..."></textarea>
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Save Note</button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: '#F9FAFB' }}>
                        <h3 className="h3" style={{ fontSize: '1rem' }}>Vitals</h3>
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <div className="text-label">Last Contact</div>
                                <div className="text-sm">2 days ago</div>
                            </div>
                            <div>
                                <div className="text-label">Engagement Score</div>
                                <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--success)' }}>85/100</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
