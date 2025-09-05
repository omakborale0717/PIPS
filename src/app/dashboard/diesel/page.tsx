

import { getBusRoutesAction, getDieselEntriesAction } from '@/app/actions';
import DieselManagementClient from '@/components/bus-watch/diesel-management-client';

export default async function DieselManagementPage() {
  const busRoutes = await getBusRoutesAction();
  const dieselEntries = await getDieselEntriesAction();

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
      <DieselManagementClient
        busRoutes={busRoutes}
        dieselEntries={dieselEntries}
      />
    </main>
  );
}
