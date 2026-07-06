import type { Metadata } from 'next';
import './styles/tienda.css';  // Changed from @/styles to ./

export const metadata: Metadata = {
  title: {
    default: 'Tienda',
    template: '%s · Tienda',
  },
};

type TiendaLayoutProps = {
  children: React.ReactNode;
};

export default function TiendaLayout({ children }: TiendaLayoutProps) {
  return children;
}