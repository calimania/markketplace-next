import Link from 'next/link';
import { markketColors } from '@/markket/colors.config';
import SpecimenTag from '@/app/components/design-system/specimen-tag';

type HeroSectionProps = {
  slug: string;
  storeTitle?: string;
  storeDescription?: string;
  logoUrl?: string;
};

export default function HeroSection({ slug, storeTitle, storeDescription, logoUrl }: HeroSectionProps) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'end', flexWrap: 'wrap' }}>
        <div>
          <SpecimenTag color={markketColors.rosa.dark}>Specimen EG-001 / Hero Display</SpecimenTag>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeTitle || slug}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  objectFit: 'cover',
                  border: '1px solid #f1f5f9',
                  background: '#ffffff',
                }}
              />
            ) : null}
            <SpecimenTag color={markketColors.neutral.mediumGray}>{storeTitle || slug}</SpecimenTag>
          </div>
          <h1
            style={{
              margin: '12px 0 0',
              fontSize: 'clamp(3.2rem, 10vw, 8rem)',
              lineHeight: 0.84,
              letterSpacing: '-0.05em',
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            The
            <br />
            Editorial
            <br />
            Gallery
          </h1>
        </div>

        <div style={{ maxWidth: 420 }}>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-markket-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(1.35rem, 3vw, 1.95rem)',
              lineHeight: 1.18,
              color: markketColors.magenta.main,
            }}
          >
            {storeDescription || 'Vibrancy is utility. This specimen is simple enough for webview, rich enough to feel editorial.'}
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href={`/${slug}`} style={{ borderRadius: 999, border: '1px solid #e2e8f0', padding: '8px 12px', color: '#334155', textDecoration: 'none' }}>
              Open store
            </Link>
            <Link href="/me" style={{ borderRadius: 999, border: '1px solid #e2e8f0', padding: '8px 12px', color: '#334155', textDecoration: 'none' }}>
              Open me
            </Link>
            <Link href="/tienda" style={{ borderRadius: 999, border: '1px solid #e2e8f0', padding: '8px 12px', color: '#334155', textDecoration: 'none' }}>
              Open tienda
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
