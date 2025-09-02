
import Header from '@/components/bus-watch/header';
import {
  SidebarProvider,
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Route, Bus, Settings, Bell, Fuel, PencilLine, UserPlus, Wrench, BookText, User, ClipboardList, ListOrdered, Bot, Contact, PlusCircle, Clock, FileSpreadsheet, ReceiptText, MapPinned, Users, IndianRupee } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <div className="flex h-full">
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-3">
                <Image
                  src="https://picsum.photos/40/40"
                  alt="School Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                  data-ai-hint="computer logo"
                />
                <h1 className="text-xl font-bold font-headline text-primary">
                  Patri swamy international public school
                </h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/dashboard">
                    <SidebarMenuButton asChild tooltip="Dashboard">
                      <span>
                        <LayoutDashboard />
                        Dashboard
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <Link href="/dashboard/driver">
                    <SidebarMenuButton asChild tooltip="Driver Dashboard">
                      <span>
                        <User />
                        Driver View
                      </span>
                    </SidebarMenuButton>
                   </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <Link href="/dashboard/student-locator">
                    <SidebarMenuButton asChild tooltip="Student Locator">
                      <span>
                        <Contact />
                        Student Locator
                      </span>
                    </SidebarMenuButton>
                   </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                   <Link href="/dashboard/routes">
                    <SidebarMenuButton asChild tooltip="Bus Routes">
                      <span>
                        <Route />
                        Bus Routes
                      </span>
                    </SidebarMenuButton>
                   </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <Link href="/dashboard/add-route">
                    <SidebarMenuButton asChild tooltip="Add Bus Route">
                      <span>
                        <PlusCircle />
                        Add Bus Route
                      </span>
                    </SidebarMenuButton>
                   </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/dashboard/arrival-times">
                    <SidebarMenuButton asChild tooltip="Arrival Times">
                      <span>
                        <Clock />
                        Arrival Times
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <Link href="/dashboard/diesel">
                    <SidebarMenuButton asChild tooltip="Diesel">
                      <span>
                        <Fuel />
                        Diesel Management
                      </span>
                    </SidebarMenuButton>
                   </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                   <Link href="/dashboard/diesel-entry">
                    <SidebarMenuButton asChild tooltip="Diesel Entry">
                      <span>
                        <PencilLine />
                        Diesel Entry
                      </span>
                    </SidebarMenuButton>
                   </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/dashboard/diesel-details">
                    <SidebarMenuButton asChild tooltip="Diesel Details">
                      <span>
                        <BookText />
                        Diesel Details
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/daily-log">
                    <SidebarMenuButton asChild tooltip="Daily Log">
                      <span>
                        <ClipboardList />
                        Daily Log
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/dashboard/daily-log-details">
                    <SidebarMenuButton asChild tooltip="Daily Log Details">
                      <span>
                        <ListOrdered />
                        Daily Log Details
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/dashboard/student-entry">
                    <SidebarMenuButton asChild tooltip="Student Entry">
                      <span>
                        <UserPlus />
                        Student Entry
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/fees-collection">
                    <SidebarMenuButton asChild tooltip="Fees Collection">
                      <span>
                        <IndianRupee />
                        Fees Collection
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/dashboard/bus-fees-paid">
                    <SidebarMenuButton asChild tooltip="Bus Fees Paid">
                      <span>
                        <ReceiptText />
                        Bus Fees Paid
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/village-fees">
                    <SidebarMenuButton asChild tooltip="Village Fees Structure">
                      <span>
                        <MapPinned />
                        Village Fees
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/bus-management">
                    <SidebarMenuButton asChild tooltip="Student Details">
                      <span>
                        <Users />
                        Student Details
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/bus-repair">
                    <SidebarMenuButton asChild tooltip="Bus Repair">
                      <span>
                        <Wrench />
                        Bus Repair
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/dashboard/disruption-analysis">
                    <SidebarMenuButton asChild tooltip="Disruption Analysis">
                      <span>
                        <Bot />
                        AI Analysis
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/excel-exporter">
                    <SidebarMenuButton asChild tooltip="Excel Workbook">
                      <span>
                        <FileSpreadsheet />
                        Excel Workbook
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/alerts">
                    <SidebarMenuButton asChild tooltip="Alerts">
                      <span>
                        <Bell />
                        Alerts
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/dashboard/settings">
                    <SidebarMenuButton asChild tooltip="Settings">
                      <span>
                        <Settings />
                        Settings
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <div className="flex items-center gap-2 p-2">
                    <Avatar>
                      <AvatarImage src="https://picsum.photos/100/100" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Admin User</span>
                      <span className="text-xs text-muted-foreground">
                        boraleojai@gmail.com
                      </span>
                    </div>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <Header />
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
