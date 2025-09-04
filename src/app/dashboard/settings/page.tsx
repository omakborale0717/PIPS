
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getGeneralSettingsAction, getBusFeesSettingsAction, getProfileSettingsAction, getVillageFeesAction } from '@/app/actions';
import { KeyRound, Building, Bus, Palette, Bell, BadgePercent, IndianRupee, Phone, MapPin, BookUser } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


export default async function SettingsPage() {

  const generalSettings = await getGeneralSettingsAction();
  const busFeesSettings = await getBusFeesSettingsAction();
  const profileSettings = await getProfileSettingsAction();
  const villageFees = await getVillageFeesAction();

  const schoolFees = [
    { class: 'Nursery', term1: 10000, term2: 10000, total: 20000 },
    { class: 'LKG', term1: 12000, term2: 12000, total: 24000 },
    { class: 'UKG', term1: 12000, term2: 12000, total: 24000 },
    { class: '1st', term1: 15000, term2: 15000, total: 30000 },
    { class: '2nd', term1: 15000, term2: 15000, total: 30000 },
    { class: '3rd', term1: 15000, term2: 15000, total: 30000 },
    { class: '4th', term1: 15000, term2: 15000, total: 30000 },
    { class: '5th', term1: 15000, term2: 15000, total: 30000 },
  ];

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="space-y-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">Settings</h1>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    School Profile
                </CardTitle>
                <CardDescription>Manage your school's information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {profileSettings ? (
                <>
                 <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">School Name</span>
                    <span className="font-medium">{profileSettings.schoolName}</span>
                  </div>
                   <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Number</span>
                    <span className="font-medium">{profileSettings.contactNumber}</span>
                  </div>
                   <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Address</span>
                    <span className="font-medium">{profileSettings.address}</span>
                  </div>
                </>
               ) : (
                <p className="text-sm text-muted-foreground">Profile settings not found.</p>
               )}
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookUser className="h-5 w-5 text-primary" />
              School Fees Structure
            </CardTitle>
            <CardDescription>
              Fee structure based on class for the academic year.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">Term 1 (₹)</TableHead>
                        <TableHead className="text-right">Term 2 (₹)</TableHead>
                        <TableHead className="text-right">Total School Fees (₹)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schoolFees.map(fee => (
                        <TableRow key={fee.class}>
                            <TableCell className="font-medium">{fee.class}</TableCell>
                            <TableCell className="text-right">{fee.term1.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{fee.term2.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-bold">{fee.total.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bus className="h-5 w-5 text-primary" />
                        Bus Fees
                    </CardTitle>
                    <CardDescription>Manage default and village-specific fee structures.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-medium mb-2 text-sm text-muted-foreground">Default Fees</h4>
                        {busFeesSettings ? (
                            <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Term 1</span>
                                <span className="font-medium">₹{busFeesSettings.monthlyFee?.toLocaleString() ?? 'N/A'}</span>
                            </div>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><BadgePercent className="h-4 w-4" /> Term 2</span>
                                <span className="font-medium">₹{busFeesSettings.lateFee?.toLocaleString() ?? 'N/A'}</span>
                            </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Default bus fee settings not found.</p>
                        )}
                    </div>
                    <Separator />
                     <div>
                        <h4 className="font-medium mb-2 text-sm text-muted-foreground">Village-Specific Fees</h4>
                        {villageFees.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Village</TableHead>
                                        <TableHead className="text-right">Term 1</TableHead>
                                        <TableHead className="text-right">Term 2</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {villageFees.map(fee => (
                                        <TableRow key={fee.id}>
                                            <TableCell className="font-medium">{fee.villageName}</TableCell>
                                            <TableCell className="text-right">₹{(fee.feeAmount / 2).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">₹{(fee.feeAmount / 2).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">No village-specific fees found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        General Settings
                    </CardTitle>
                    <CardDescription>Application-wide settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {generalSettings ? (
                        <>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><Palette className="h-4 w-4" /> App Theme</span>
                            <Badge variant="outline" className="capitalize">{generalSettings.appTheme}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</span>
                            <Badge variant={generalSettings.notifications ? "default" : "secondary"}>
                                {generalSettings.notifications ? "Enabled" : "Disabled"}
                            </Badge>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Currency</span>
                            <span className="font-medium">{generalSettings.currency}</span>
                        </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">General settings not found.</p>
                    )}
                </CardContent>
            </Card>
        </div>


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Login Credentials
            </CardTitle>
            <CardDescription>
              Default login credentials for this demo application.
            </CardDescription>
          </CardHeader>
           <CardContent>
            <Alert>
              <AlertTitle>Default Credentials</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><b>Admin:</b> username: `SIDRAM`, password: `123456`</li>
                  <li><b>Driver:</b> username: `driver`, password: `password`</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
