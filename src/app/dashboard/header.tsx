
"use client"
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const getTitleFromPath = (path: string) => {
  if (path === '/dashboard') return 'Dashboard';
  if (path.startsWith('/dashboard/driver')) return 'Driver Dashboard';
  if (path.startsWith('/dashboard/routes')) return 'Bus Routes';
  if (path.startsWith('/dashboard/add-route')) return 'Add Bus Route';
  if (path.startsWith('/dashboard/arrival-times')) return 'Arrival Times';
  if (path.startsWith('/dashboard/diesel-entry')) return 'Diesel Entry';
  if (path.startsWith('/dashboard/student-entry')) return 'Student Entry';
  if (path.startsWith('/dashboard/fees-collection')) return 'Fees Collection';
  if (path.startsWith('/dashboard/bus-fees-paid')) return 'Bus Fees Paid';
  if (path.startsWith('/dashboard/village-fees')) return 'Village Fees Structure';
  if (path.startsWith('/dashboard/student-locator')) return 'Student Locator';
  if (path.startsWith('/dashboard/diesel')) return 'Diesel Management';
  if (path.startsWith('/dashboard/daily-log-details')) return 'Daily Log Details';
  if (path.startsWith('/dashboard/daily-log')) return 'Daily Log';
  if (path.startsWith('/dashboard/settings')) return 'Settings';
  if (path.startsWith('/dashboard/bus-management/')) return 'Student Details';
  if (path.startsWith('/dashboard/bus-management')) return 'Student Details';
  if (path.startsWith('/dashboard/bus-repair')) return 'Bus Repair';
  if (path.startsWith('/dashboard/disruption-analysis')) return 'AI Disruption Analysis';
  if (path.startsWith('/dashboard/excel-exporter')) return 'Excel Workbook';
  if (path.startsWith('/dashboard/alerts')) return 'Alerts';
  return 'Bus Management';
}

const Header = () => {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold font-headline text-primary">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default Header;
