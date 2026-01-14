"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 6 }}></div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>AI Outreach Ops</span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <NavLink href="/" icon="📊" label="Dashboard" active={pathname === '/'} />
                <NavLink href="/campaigns" icon="🚀" label="Campaigns" active={pathname.startsWith('/campaigns')} />
                <NavLink href="/intelligence" icon="🧠" label="Intelligence" active={pathname.startsWith('/intelligence')} />
                <NavLink href="/leads" icon="👥" label="Leads" active={pathname.startsWith('/leads')} />
                <NavLink href="/compose" icon="✉️" label="Compose" active={pathname.startsWith('/compose')} />
                <NavLink href="/reporting" icon="📈" label="Reporting" active={pathname.startsWith('/reporting')} />
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <NavLink href="/settings" icon="⚙️" label="Settings" active={pathname.startsWith('/settings')} />
            </div>
        </aside>
    );
}

function NavLink({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
    return (
        <Link href={href} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '8px',
            background: active ? '#F3F4F6' : 'transparent',
            fontWeight: active ? 600 : 500,
            color: active ? 'var(--foreground)' : '#6B7280'
        }}>
            <span>{icon}</span>
            {label}
        </Link>
    );
}
