export default function MetricCard({ title, value, change, trend = 'up' }: { title: string; value: string; change?: string; trend?: 'up' | 'down' }) {
    const isPositive = trend === 'up';
    return (
        <div className="card">
            <div className="text-label" style={{ marginBottom: '0.5rem' }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <div className="h2" style={{ fontSize: '2rem' }}>{value}</div>
                {change && (
                    <div style={{
                        color: isPositive ? 'var(--success)' : 'var(--danger)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '12px'
                    }}>
                        {isPositive ? '↑' : '↓'} {change}
                    </div>
                )}
            </div>
            <div style={{ width: '100%', height: '4px', background: '#F3F4F6', marginTop: '1rem', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'var(--primary)' }}></div>
            </div>
        </div>
    );
}
