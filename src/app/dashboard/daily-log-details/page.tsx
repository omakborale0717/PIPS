

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getDailyLogsAction } from '@/app/actions';
import DailyLogDetailsClient from '@/components/bus-watch/daily-log-details-client';

export default async function DailyLogDetailsPage() {
  const dailyLogs = await getDailyLogsAction();

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <DailyLogDetailsClient initialLogs={dailyLogs} />
    </main>
  );
}
