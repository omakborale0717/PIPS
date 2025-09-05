
import { getBusRoutesAction } from '@/app/actions';
import RoutesClient from '@/components/bus-watch/routes-client';

export default async function RoutesPage() {
  const busRoutes = await getBusRoutesAction();

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <RoutesClient initialRoutes={busRoutes} />
    </main>
  );
}
