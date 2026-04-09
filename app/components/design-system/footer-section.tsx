import SpecimenTag from '@/app/components/design-system/specimen-tag';

type StoreLink = {
  Label?: string;
  URL: string;
};

type FooterSectionProps = {
  links?: StoreLink[];
};

export default function FooterSection({ links = [] }: FooterSectionProps) {
  const safeLinks = links
    .filter((link) => !!link?.URL)
    .slice(0, 4);

  return (
    <footer
      style={{
        marginTop: 56,
        paddingTop: 26,
        borderTop: '2px dashed #fbcfe8',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div style={{ fontWeight: 900, textTransform: 'uppercase' }}>markket</div>
        <div style={{ marginTop: 6 }}>
          <SpecimenTag>Built for the vibrant curator.</SpecimenTag>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {safeLinks.length > 0 ? (
          safeLinks.map((link) => (
            <a
              key={`${link.Label || 'link'}-${link.URL}`}
              href={link.URL}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <SpecimenTag>{link.Label || link.URL}</SpecimenTag>
            </a>
          ))
        ) : (
          <>
            <a href="#" style={{ textDecoration: 'none' }}><SpecimenTag>Archive</SpecimenTag></a>
            <a href="#" style={{ textDecoration: 'none' }}><SpecimenTag>Contact</SpecimenTag></a>
            <a href="#" style={{ textDecoration: 'none' }}><SpecimenTag>Studio</SpecimenTag></a>
          </>
        )}
      </div>
    </footer>
  );
}
