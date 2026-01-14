'use client';

import { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';

interface DashboardStats {
  overview: {
    totalLeads: number;
    newLeads: number;
    sentLeads: number;
    repliedLeads: number;
    bookedLeads: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalDrafts: number;
    sentDrafts: number;
    approvedDrafts: number;
  };
  metrics: {
    revenueInfluence: string;
    meetingConvRate: string;
    positiveReplyRatio: string;
    sentimentIndex: string;
  };
  campaigns: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    totalDrafts: number;
    sentDrafts: number;
    conversionRate: number;
  }>;
  funnel: {
    sent: number;
    opened: number;
    replied: number;
    meetings: number;
  };
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed data first, then fetch stats
    fetch('/api/seed', { method: 'POST' })
      .finally(() => fetchStats());
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (!data.error) {
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="h1">Executive Campaign Analytics</h1>
          <p className="text-sm">High-stakes outreach performance and strategic sentiment tracking</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary">
            Filter: Last 30 Days
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            Export Report
          </button>
        </div>
      </div>

      {/* Quick Actions at Top */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Quick Actions</h4>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="/intelligence" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>🔍 Discover Leads</a>
          <a href="/compose" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>✉️ Compose Email</a>
          <a href="/campaigns" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>🚀 View Campaigns</a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <MetricCard
          title="Total Revenue Influence"
          value={stats?.metrics.revenueInfluence || '$0'}
          change="14.2%"
          trend="up"
        />
        <MetricCard
          title="Meeting Conv. Rate"
          value={stats?.metrics.meetingConvRate || '0%'}
          change="2.1%"
          trend="up"
        />
        <MetricCard
          title="Positive Reply Ratio"
          value={stats?.metrics.positiveReplyRatio || '0%'}
          change="0.5%"
          trend="down"
        />
        <MetricCard
          title="Brand Sentiment Index"
          value={stats?.metrics.sentimentIndex || '0/100'}
          change="4.0%"
          trend="up"
        />
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <QuickStat label="Total Leads" value={stats?.overview.totalLeads || 0} />
        <QuickStat label="Emails Sent" value={stats?.overview.sentDrafts || 0} />
        <QuickStat label="Active Campaigns" value={stats?.overview.activeCampaigns || 0} />
        <QuickStat label="Replies" value={stats?.overview.repliedLeads || 0} />
        <QuickStat label="Meetings Booked" value={stats?.overview.bookedLeads || 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Chart Card */}
        <div className="card" style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="h3">Outreach Funnel</h3>
          </div>

          <div style={{ padding: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <FunnelStep
              label="Sent"
              value={stats?.funnel.sent || 0}
              color="#60A5FA"
            />
            <div style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>→</div>
            <FunnelStep
              label="Opened"
              value={stats?.funnel.opened || 0}
              sub={stats?.funnel.sent ? `${Math.round((stats.funnel.opened / stats.funnel.sent) * 100)}%` : '0%'}
              color="#3B82F6"
            />
            <div style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>→</div>
            <FunnelStep
              label="Replied"
              value={stats?.funnel.replied || 0}
              sub={stats?.funnel.sent ? `${Math.round((stats.funnel.replied / Math.max(stats.funnel.sent, 1)) * 100)}%` : '0%'}
              color="#2563EB"
            />
            <div style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>→</div>
            <FunnelStep
              label="Meetings"
              value={stats?.funnel.meetings || 0}
              sub={stats?.funnel.replied ? `${Math.round((stats.funnel.meetings / Math.max(stats.funnel.replied, 1)) * 100)}%` : '0%'}
              color="#1D4ED8"
            />
          </div>


        </div>

        {/* Leaderboard */}
        <div className="card">
          <h3 className="h3" style={{ marginBottom: '1.5rem' }}>Campaign Leaderboard</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {stats?.campaigns && stats.campaigns.length > 0 ? (
              stats.campaigns.map((campaign, index) => (
                <CampaignRow
                  key={campaign.id}
                  name={campaign.name}
                  sub={`${campaign.type} • ${campaign.totalDrafts} leads`}
                  score={`${campaign.conversionRate}%`}
                  status={
                    campaign.status === 'ACTIVE' ? 'OPTIMAL' :
                      campaign.status === 'PAUSED' ? 'WARNING' :
                        'SETUP'
                  }
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
                <p className="text-sm">No campaigns yet</p>
                <a href="/campaigns" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Create Campaign
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
      <div className="text-label">{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{value}</div>
    </div>
  );
}

function FunnelStep({ label, value, sub, color }: { label: string; value: number; sub?: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value.toLocaleString()}</div>
      <div style={{ fontWeight: 600 }}>{label}</div>
      {sub && <div className="text-sm">{sub} conversion</div>}
    </div>
  );
}

function CampaignRow({ name, sub, score, status }: { name: string; sub: string; score: string; status: string }) {
  const statusColor = status === 'OPTIMAL' ? 'var(--success)' : status === 'WARNING' ? 'var(--warning)' : '#9CA3AF';
  const statusBg = status === 'OPTIMAL' ? 'rgba(16, 185, 129, 0.1)' : status === 'WARNING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)';

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
          background: statusBg,
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
