import SpecimenTag from '@/app/components/design-system/specimen-tag';

type DashboardSectionProps = {
  slug: string;
};

const card = {
  background: '#ffffff',
  border: '1px solid #f1f5f9',
  borderRadius: 16,
} as const;

export default function DashboardSection({ slug }: DashboardSectionProps) {
  const views = [
    { title: 'Overview', route: `/tienda/${slug}`, highlight: 'Today snapshot', accent: '#db2777' },
    { title: 'Inventory', route: `/tienda/${slug}/products`, highlight: 'Status + tap to edit', accent: '#06b6d4' },
    { title: 'Editor', route: `/tienda/${slug}/articles/edit/article-id`, highlight: 'Sticky save + SEO action', accent: '#eab308' },
  ];

  return (
    <section style={{ marginBottom: 44 }}>
      <div style={{ marginBottom: 14 }}>
        <SpecimenTag>Specimen OS-001 / Dashboard Root</SpecimenTag>
        <h2 style={{ margin: '8px 0 0', fontWeight: 900, fontSize: 'clamp(2.2rem, 6vw, 4.8rem)', lineHeight: 0.9, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
          The Sovereign OS
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) minmax(0, 1fr)', gap: 16 }}>
        <aside style={{ ...card, padding: 16, borderRight: '4px solid #db2777' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 900, textTransform: 'uppercase' }}>markket</div>
            <SpecimenTag>Dashboard v1.0</SpecimenTag>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {['Overview', 'Inventory', 'Analytics', 'Orders'].map((item, idx) => (
              <div
                key={item}
                style={{
                  borderRadius: 10,
                  padding: '10px 12px',
                  background: idx === 0 ? 'rgba(219,39,119,0.1)' : 'transparent',
                  color: idx === 0 ? '#be185d' : '#64748b',
                  fontFamily: 'var(--font-markket-mono)',
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.09em',
                  borderRight: idx === 0 ? '4px solid #db2777' : 'none',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        <div style={{ display: 'grid', gap: 16 }}>
          <article style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SpecimenTag>Data Set / Transaction Log</SpecimenTag>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: '#f87171', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: 99, background: '#fbbf24', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: 99, background: '#34d399', display: 'inline-block' }} />
              </div>
            </div>
            <div style={{ padding: 16, display: 'grid', gap: 8 }}>
              {[
                ['Tropical Saturation Index', 'Optimal', '88.4%'],
                ['Feather Yield', 'Warning', '12.1%'],
                ['Gradient Flow', 'Active', '99.9%'],
              ].map((row) => (
                <div key={row[0]} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: '#fff' }}>
                  <div style={{ fontWeight: 700 }}>{row[0]}</div>
                  <SpecimenTag>{row[1]}</SpecimenTag>
                  <SpecimenTag color="#be185d">{row[2]}</SpecimenTag>
                </div>
              ))}
            </div>
          </article>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
            {views.map((view) => (
              <article key={view.title} style={{ ...card, padding: 16 }}>
                <SpecimenTag color={view.accent}>View</SpecimenTag>
                <h3 style={{ margin: '8px 0 6px', fontSize: '1.25rem', lineHeight: 1, fontWeight: 900 }}>{view.title}</h3>
                <SpecimenTag>{view.route}</SpecimenTag>
                <div style={{ marginTop: 14, borderRadius: 12, padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.88rem' }}>
                  {view.highlight}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
