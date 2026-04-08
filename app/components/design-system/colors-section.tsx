import SpecimenTag from '@/app/components/design-system/specimen-tag';

const swatches = [
  { name: 'Primary', code: '#DB2777', note: 'Core pulse', bg: '#db2777', fg: '#ffffff' },
  { name: 'Secondary', code: '#06B6D4', note: 'Cool depth', bg: '#06b6d4', fg: '#ffffff' },
  { name: 'Tertiary', code: '#EAB308', note: 'Energy accent', bg: '#eab308', fg: '#422006' },
];

export default function ColorsSection() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 44 }}>
      {swatches.map((swatch) => (
        <article key={swatch.name} style={{ borderRadius: 18, padding: 20, background: swatch.bg, color: swatch.fg, boxShadow: '0 14px 32px rgba(2, 8, 23, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ fontWeight: 900, fontSize: '1.45rem', textTransform: 'uppercase' }}>{swatch.name}</div>
            <SpecimenTag color="rgba(255,255,255,0.8)">{swatch.code}</SpecimenTag>
          </div>
          <div style={{ marginTop: 20 }}>
            <SpecimenTag color="rgba(255,255,255,0.84)">{swatch.note}</SpecimenTag>
          </div>
        </article>
      ))}
    </section>
  );
}
