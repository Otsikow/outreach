"use client";

export default function LeadsPage() {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="h1">Leads & Contacts</h1>
                    <p className="text-sm">Verified contact methods and compliance audit trails.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#9CA3AF' }}>🔍</span>
                        <input type="text" placeholder="Search records..." style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '200px' }} />
                    </div>
                    <button className="btn btn-primary">
                        + Manual Lead
                    </button>
                </div>
            </div>

            {/* Detail View for a specific entity (Mocked as if one is selected) */}
            <div className="card" style={{ background: '#111827', color: 'white', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <h2 className="h2" style={{ margin: 0 }}>STANFORD UNIVERSITY</h2>
                            <span style={{ background: '#4C1D95', color: '#C4B5FD', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>VERIFIED ENTITY</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#9CA3AF' }}>
                            <span>🔗 stanford.edu</span>
                            <span>📍 Palo Alto, CA</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="text-label" style={{ color: '#9CA3AF' }}>Audit Progress</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, fontStyle: 'italic' }}>68% COMPLETE</div>
                    </div>
                </div>
            </div>

            <h3 className="h3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '4px', height: '24px', background: 'var(--accent)' }}></div>
                EVIDENCE TIER 01: ROLE-BASED EMAILS
            </h3>

            <div className="card" style={{ padding: 0, marginBottom: '2rem' }}>
                <TableHeader />
                <TableRow
                    email="admissions@stanford.edu"
                    source="/about/admissions/contact"
                    confidence="98% HIGH CONFIDENCE"
                    status="APPROVE"
                />
                <TableRow
                    email="info@stanford.edu"
                    source="/footer/general"
                    confidence="92% HIGH CONFIDENCE"
                    status="APPROVE"
                />
                <TableRow
                    email="media@stanford.edu"
                    source="/news/press-room"
                    confidence="76% MEDIUM"
                    status="REVIEW"
                />
            </div>

            <h3 className="h3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '4px', height: '24px', background: 'var(--accent)' }}></div>
                EVIDENCE TIER 02: DISCOVERED INQUIRY PATHS
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <PathCard title="Undergraduate Admission Inquiry Form" path="/admissions/apply/help" type="ADMISSIONS" />
                <PathCard title="Central University Directory & Contact" path="/contact-us" type="GENERAL" />
            </div>

        </div>
    );
}

function TableHeader() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr', padding: '1rem', borderBottom: '1px solid var(--border)', background: '#F9FAFB' }}>
            <div className="text-label">Email Address</div>
            <div className="text-label">Provenance / Source</div>
            <div className="text-label">Confidence Score</div>
            <div className="text-label" style={{ textAlign: 'right' }}>Verification Actions</div>
        </div>
    );
}

function TableRow({ email, source, confidence, status }: any) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr', padding: '1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                <a href="/leads/1" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 600 }}>
                    {email}
                </a>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔗</span> {source}
            </div>
            <div>
                <span style={{
                    background: confidence.includes('HIGH') ? '#111827' : '#374151',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    fontStyle: 'italic'
                }}>
                    {confidence}
                </span>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-success-soft" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>APPROVE</button>
                <button className="btn btn-danger-soft" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>REJECT</button>
            </div>
        </div>
    );
}

function PathCard({ title, path, type }: any) {
    return (
        <div className="card" style={{ background: '#262626', color: 'white', border: '1px solid #404040' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'white', color: 'black', padding: '2px 4px', borderRadius: '2px' }}>{type}</span>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Path: {path}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{title}</div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid #404040', color: '#9CA3AF', borderRadius: '4px', fontSize: '0.75rem' }}>INSPECT URL ↗</button>
                <button style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', border: '1px solid #059669', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>APPROVE</button>
            </div>
        </div>
    );
}
