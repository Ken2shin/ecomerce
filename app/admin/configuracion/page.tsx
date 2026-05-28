import { redirect } from 'next/navigation';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import AdminConfigurationClient from '@/components/admin/configuration-client';

export const metadata = {
  title: 'Configuración | Rich Shakes Admin',
  description: 'Administra la configuración de tu tienda',
};

export default async function ConfigurationPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  const userIsAdmin = await isAdmin(user.id);
  if (!userIsAdmin) {
    redirect('/');
  }

  return (
    <main className="flex-1">
      <AdminConfigurationClient />
    </main>
  );
}
