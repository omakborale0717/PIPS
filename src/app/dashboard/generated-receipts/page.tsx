
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function GeneratedReceiptsPage() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Generated Receipts
            </CardTitle>
            <CardDescription>
              A log of all recently generated fee receipts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12" />
                <p className="mt-4">No receipts have been generated yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
