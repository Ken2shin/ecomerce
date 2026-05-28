import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Admin - Rich Shakes',
  description: 'Panel administrativo',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Reemplazamos <html> y <body> por un contenedor div normal
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}