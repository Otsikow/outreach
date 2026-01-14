'use client';

import MetricCard from '../components/MetricCard';

export default function Home() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="h1">Executive Campaign Analytics</h1>
          <p className="text-sm">High-stakes outreach performance and strategic sentiment tracking</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary">
            Filter: Oct 1, 2023 - Oct 31, 2023
          </button>
          <button className="btn btn-primary" onClick={() => alert('Report generation started...')}>
            Export Report
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <MetricCard title="Total Revenue Influence" value="$4.2M" change="14.2%" trend="up" />
        <MetricCard title="Meeting Conv. Rate" value="12.4%" change="2.1%" trend="up" />
        <MetricCard title="Positive Reply Ratio" value="38.2%" change="0.5%" trend="down" />
        <MetricCard title="Brand Sentiment Index" value="88/100" change="4.0%" trend="up" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Chart Card */}
        <div className="card" style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="h3">Outreach Volume vs. Engagement Trends</h3>
            <div className="text-sm">● Volume ● Engagement</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', background: '#F9FAFB', borderRadius: '8px', border: '1px dashed #E5E7EB' }}>
            Chart Placeholder (Recharts/D3)
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <h3 className="h3" style={{ marginBottom: '1.5rem' }}>Campaign Leaderboard</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <CampaignRow name="Tier 1 EMEA Expansion" sub="Enterprise • AI-Ops" score="18.4%" status="OPTIMAL" />
            <CampaignRow name="Founder-Led Outreach" sub="Mid-Market • Series B" score="12.1%" status="OPTIMAL" />
            <CampaignRow name="Q4 Event Follow-up" sub="Multi-Channel • Global" score="9.8%" status="WARNING" />
            <CampaignRow name="SDR Cold Sequences" sub="Inbound • High-Volume" score="4.2%" status="AT RISK" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignRow({ name, sub, score, status }: any) {
  const statusColor = status === 'OPTIMAL' ? 'var(--success)' : status === 'WARNING' ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div className="text-sm" style={{ fontSize: '0.75rem' }}>{sub}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700 }}>{score}</div>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: statusColor,
          background: status === 'OPTIMAL' ? 'rgba(16, 185, 129, 0.1)' : status === 'WARNING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          {status}
        </div>
      </div>
    </div>
  );
}
