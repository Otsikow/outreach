"use client";

import MetricCard from '@/components/MetricCard';

export default function ReportingPage() {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="h1">Reporting & ROI</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="select">
                        <option>Last 30 Days</option>
                        <option>Last Quarter</option>
                        <option>Year to Date</option>
                    </select>
                    <button className="btn btn-primary">Download CSV</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <MetricCard title="Emails Sent" value="14,203" change="12%" trend="up" />
                <MetricCard title="Open Rate" value="68.4%" change="2.1%" trend="up" />
                <MetricCard title="Reply Rate" value="12.1%" change="0.4%" trend="down" />
                <MetricCard title="Meetings Booked" value="142" change="15%" trend="up" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <h3 className="h3">Funnel Velocity</h3>
                    <div style={{ padding: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <FunnelStep label="Sent" value="14k" color="#60A5FA" />
                        <div style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>→</div>
                        <FunnelStep label="Opened" value="9.7k" sub="68%" color="#3B82F6" />
                        <div style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>→</div>
                        <FunnelStep label="Replied" value="1.7k" sub="12%" color="#2563EB" />
                        <div style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>→</div>
                        <FunnelStep label="Meeting" value="142" sub="8%" color="#1D4ED8" />
                    </div>
                </div>

                <div className="card">
                    <h3 className="h3">Reply Sentiment</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <SentimentRow label="Positive / Interested" value={45} color="var(--success)" />
                        <SentimentRow label="Referral / Forward" value={20} color="#60A5FA" />
                        <SentimentRow label="Out of Office" value={15} color="#9CA3AF" />
                        <SentimentRow label="Negative / Unsubscribe" value={10} color="var(--danger)" />
                        <SentimentRow label="Hard Bounce" value={10} color="#EF4444" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FunnelStep({ label, value, sub, color }: any) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: color }}>{value}</div>
            <div style={{ fontWeight: 600 }}>{label}</div>
            {sub && <div className="text-sm">{sub} conversion</div>}
        </div>
    );
}

function SentimentRow({ label, value, color }: any) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                <span>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#F3F4F6', borderRadius: '3px' }}>
                <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '3px' }}></div>
            </div>
        </div>
    );
}
