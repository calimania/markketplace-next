import SpecimenTag from '@/app/components/design-system/specimen-tag';

const cards = [
  {
    tag: 'Category / Textiles',
    title: 'Cali Mesh Blazer',
    note: 'Shadow / diffused magenta',
    image:
      'https://nyc3.digitaloceanspaces.com/markketplace/abel_robles_U_Qs_Io_G_Lh_FN_8_unsplash_6a63f82ee4.jpg',
    tint: 'rgba(159, 0, 81, 0.66)',
  },
  {
    tag: 'Colourway / Guacamaya',
    title: 'Wing-Tip Palette',
    note: 'Transform / stagger + hover',
    image:
      'https://nyc3.digitaloceanspaces.com/markketplace/james_lee_RZ_Ugn_T81_E78_unsplash_28b06d48c7.jpg',
    tint: 'rgba(0, 88, 103, 0.62)',
  },
  {
    tag: 'Limited Archive',
    title: 'Heroic Magenta',
    note: 'Border / dashed ghost',
    image:
      'https://nyc3.digitaloceanspaces.com/markketplace/brass_monkey_SST_21_Ja_Fy_Tc_unsplash_389f29d17c.jpg',
    tint: 'rgba(228, 0, 124, 0.24)',
  },
];

export default function EditorialGallerySection() {
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ marginBottom: 16 }}>
        <SpecimenTag color="#9f0051">Specimen EG-002 / Editorial Cards</SpecimenTag>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {cards.map((card, index) => (
          <article
            key={card.title}
            className="group fade-in"
            style={{
              marginTop: index === 1 ? 24 : 0,
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 20px 38px rgba(2, 8, 23, 0.16)',
              border: index === 2 ? '2px dashed #fbcfe8' : 'none',
              background: '#fff',
              transition: 'transform 280ms ease, box-shadow 280ms ease',
              animationDelay: `${index * 90}ms`,
            }}
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '3 / 4',
                minHeight: 340,
                overflow: 'hidden',
              }}
            >
              <img
                src={card.image}
                alt={card.title}
                loading="lazy"
                className="group-hover:scale-[1.04]"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  display: 'block',
                  transition: 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(180deg, transparent 35%, ${card.tint} 100%)`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 18,
                }}
              >
                <SpecimenTag color="rgba(255,255,255,0.86)">{card.tag}</SpecimenTag>
                <h3 style={{ margin: '10px 0 6px', color: '#fff', fontWeight: 900, fontSize: '1.7rem', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
                  {card.title}
                </h3>
                <SpecimenTag color="rgba(255,255,255,0.8)">{card.note}</SpecimenTag>
              </div>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .group:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 44px rgba(2, 8, 23, 0.2);
        }
      `}</style>
    </section>
  );
}
