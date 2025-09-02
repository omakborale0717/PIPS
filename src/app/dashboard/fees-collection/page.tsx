
import { getStudentsAction, getBusFeePaymentsAction } from '@/app/actions';
import FeesCollectionClient from '@/components/bus-watch/fees-collection-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IndianRupee } from 'lucide-react';

export default async function FeesCollectionPage() {
  const students = await getStudentsAction();
  const payments = await getBusFeePaymentsAction();

  // This is a placeholder for more detailed fee structures
  // In a real app, this would come from the database per student
  const feeCategories = [
    { id: 'tuition', name: 'School Fees', totalAmount: 20000 },
    { id: 'bus', name: 'Bus Fees', totalAmount: 5000 },
    { id: 'fine', name: 'Fine', totalAmount: 500 },
    { id: 'remark', name: 'Remark', totalAmount: 300 },
  ];

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-6 w-6" />
              Fees Collection
            </CardTitle>
            <CardDescription>
              Search for a student to view and pay their fees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeesCollectionClient
              students={students}
              payments={payments}
              feeCategories={feeCategories}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
