import { IconCheck, IconSparkles, IconX } from '@tabler/icons-react';
import SpecimenTag from '@/app/components/design-system/specimen-tag';

const card = {
  background: '#ffffff',
  border: '1px solid #f1f5f9',
  borderRadius: 16,
} as const;

function SmallAction({ label, tone }: { label: string; tone: 'primary' | 'neutral' }) {
  return (
    <button
      type="button"
      style={{
        border: tone === 'primary' ? 'none' : '1px solid #e2e8f0',
        background: tone === 'primary' ? '#db2777' : '#ffffff',
        color: tone === 'primary' ? '#ffffff' : '#0f172a',
        borderRadius: 999,
        padding: '8px 12px',
        fontSize: '0.72rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </button>
  );
}

export default function InteractionsSection() {
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ marginBottom: 12 }}>
        <SpecimenTag>Specimen UX-002 / Inline Edit + SEO Assist</SpecimenTag>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 16 }}>
        <article style={{ ...card, padding: 18 }}>
          <SpecimenTag color="#9f0051">Inline editable title</SpecimenTag>
          <div style={{ marginTop: 8, borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-markket-mono)', color: '#94a3b8', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              display mode
            </div>
            <div style={{ marginTop: 6, fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              The Sustainable Cork Mat
            </div>
          </div>

          <div style={{ marginTop: 10, borderRadius: 12, border: '1px solid #db2777', background: '#fff1f7', padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-markket-mono)', color: '#9f0051', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              edit mode
            </div>
            <input
              readOnly
              value="The Sustainable Cork Mat"
              style={{ width: '100%', marginTop: 8, border: '1px solid #f9a8d4', borderRadius: 10, padding: '10px 12px', fontSize: '1rem', background: '#ffffff', color: '#111827' }}
            />
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <SmallAction label="Save" tone="primary" />
              <SmallAction label="Cancel" tone="neutral" />
            </div>
          </div>
        </article>

        <article style={{ ...card, padding: 18 }}>
          <SpecimenTag color="#0e7490">SEO suggestion panel</SpecimenTag>
          <div style={{ marginTop: 8, display: 'grid', gap: 10 }}>
            <div style={{ borderRadius: 12, border: '1px solid #e2e8f0', padding: '10px 12px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconSparkles size={16} color="#0ea5e9" />
                <div style={{ fontFamily: 'var(--font-markket-mono)', fontSize: '0.72rem', color: '#475569' }}>status: generating</div>
              </div>
            </div>
            <div style={{ borderRadius: 12, border: '1px solid #d1fae5', padding: '10px 12px', background: '#ecfdf5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconCheck size={16} color="#10b981" />
                <div style={{ fontFamily: 'var(--font-markket-mono)', fontSize: '0.72rem', color: '#065f46' }}>status: suggestion ready</div>
              </div>
              <p style={{ margin: '8px 0 0', color: '#064e3b', lineHeight: 1.5 }}>
                Regenerative cork desk mat handcrafted for mindful workspaces, featuring natural grip and clean minimal texture.
              </p>
            </div>
            <div style={{ borderRadius: 12, border: '1px solid #fee2e2', padding: '10px 12px', background: '#fef2f2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconX size={16} color="#ef4444" />
                <div style={{ fontFamily: 'var(--font-markket-mono)', fontSize: '0.72rem', color: '#991b1b' }}>status: provider timeout</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SmallAction label="Suggest SEO" tone="primary" />
            <SmallAction label="Apply" tone="neutral" />
          </div>
        </article>
      </div>
    </section>
  );
}
