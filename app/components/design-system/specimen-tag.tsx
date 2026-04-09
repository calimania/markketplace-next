import type { CSSProperties } from 'react';

type SpecimenTagProps = {
  children: string;
  color?: string;
};

export default function SpecimenTag({ children, color = '#64748b' }: SpecimenTagProps) {
  const style: CSSProperties = {
    fontFamily: 'var(--font-markket-mono)',
    fontSize: '0.66rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color,
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    lineHeight: 1.4,
  };

  return <span style={style}>{children}</span>;
}
