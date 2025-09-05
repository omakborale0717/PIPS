
import { getStudentsAction, getBusFeePaymentsAction, getSchoolFeesAction, getVillageFeesAction } from '@/app/actions';
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
  const schoolFees = await getSchoolFeesAction();
  const villageFees = await getVillageFeesAction();

  // This is a placeholder for non-dynamic fee types
  const otherFeeCategories = [
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
              schoolFees={schoolFees}
              villageFees={villageFees}
              otherFeeCategories={otherFeeCategories}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
