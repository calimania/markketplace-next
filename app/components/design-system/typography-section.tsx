import SpecimenTag from '@/app/components/design-system/specimen-tag';

const panel = {
  background: '#ffffff',
  border: '1px solid #f1f5f9',
  borderRadius: 16,
} as const;

export default function TypographySection() {
  return (
    <section style={{ marginBottom: 44 }}>
      <div style={{ marginBottom: 12 }}>
        <SpecimenTag>Specimen TY-001 / Font Roles</SpecimenTag>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 1fr)', gap: 16 }}>
        <article style={{ ...panel, padding: 18 }}>
          <SpecimenTag color="#9f0051">Display (Newsreader italic)</SpecimenTag>
          <h3 style={{ margin: '10px 0 0', fontFamily: 'var(--font-markket-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 0.95 }}>
            The rhythm of thoughtful commerce.
          </h3>

          <SpecimenTag color="#0e7490">Headline + body (Manrope)</SpecimenTag>
          <h4 style={{ margin: '12px 0 0', fontWeight: 900, fontSize: '1.45rem', letterSpacing: '-0.02em' }}>
            Dense meaning, minimal chrome.
          </h4>
          <p style={{ margin: '8px 0 0', color: '#475569', lineHeight: 1.7, maxWidth: 640 }}>
            Use Manrope for navigational clarity, settings content, and dashboard lists. Keep line lengths moderate in webview to avoid
            cognitive overload and truncation bugs.
          </p>
        </article>

        <article style={{ ...panel, padding: 18 }}>
          <SpecimenTag color="#64748b">System labels (Roboto Mono)</SpecimenTag>
          <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
            {[
              'route: /tienda/store-slug/articles/edit/article-id',
              'state: draft -> review -> published',
              'seo: suggested title confidence 0.92',
            ].map((line) => (
              <div key={line} style={{ borderRadius: 10, border: '1px dashed #e2e8f0', background: '#f8fafc', padding: '10px 12px', fontFamily: 'var(--font-markket-mono)', fontSize: '0.75rem', color: '#475569' }}>
                {line}
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
