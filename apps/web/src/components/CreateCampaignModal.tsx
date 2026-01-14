"use client";

import { useState } from 'react';
import { PLAYBOOKS, generateTemplates } from '@/lib/playbooks';

export default function CreateCampaignModal({ isOpen, onClose, onSave }: any) {
    const [step, setStep] = useState(1);
    const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', city: 'London', region: 'West Africa' });

    if (!isOpen) return null;

    const handleNext = () => {
        if (step === 1 && selectedPlaybook) setStep(2);
        else if (step === 2) setStep(3);
    };

    const handleSave = () => {
        const playbook = PLAYBOOKS.find(p => p.id === selectedPlaybook);
        const mockCampaign = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name || playbook?.name,
            type: playbook?.name, // For display
            status: 'DRAFT',
            progress: 0,
            leads: 0,
            createdAt: new Date().toISOString()
        };
        onSave(mockCampaign);
        onClose();
        setStep(1); // Reset
    };

    const currentPlaybook = PLAYBOOKS.find(p => p.id === selectedPlaybook);
    const templates = selectedPlaybook ? generateTemplates(currentPlaybook?.type as string, formData) : [];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
            <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 className="h2">New Campaign - Step {step}/3</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
                </div>

                {/* STEP 1: Select Playbook */}
                {step === 1 && (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {PLAYBOOKS.map(pb => (
                            <div
                                key={pb.id}
                                onClick={() => setSelectedPlaybook(pb.id)}
                                style={{
                                    padding: '1rem',
                                    border: selectedPlaybook === pb.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: selectedPlaybook === pb.id ? '#EFF6FF' : 'white'
                                }}
                            >
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{pb.icon} {pb.name}</div>
                                <div className="text-sm">{pb.description}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 2: Configure */}
                {step === 2 && currentPlaybook && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Campaign Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder={`${currentPlaybook.name} - Q1`}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                            />
                        </div>

                        {currentPlaybook.type === 'REAM_CLEANING' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Target City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                                />
                            </div>
                        )}

                        {currentPlaybook.type === 'UNIDOXIA' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Target Region</label>
                                <input
                                    type="text"
                                    value={formData.region}
                                    onChange={e => setFormData({ ...formData, region: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: Preview */}
                {step === 3 && (
                    <div>
                        <h3 className="h3" style={{ marginBottom: '1rem' }}>Generated Templates</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {templates.map((tpl: any, idx: number) => (
                                <div key={idx} style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subject: {tpl.subject}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: tpl.body }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '6px' }}
                        >
                            Back
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={!selectedPlaybook}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: selectedPlaybook ? 'var(--primary)' : '#9CA3AF',
                                color: 'white', border: 'none', borderRadius: '6px'
                            }}
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            style={{ padding: '0.75rem 1.5rem', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '6px' }}
                        >
                            Launch Campaign
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
