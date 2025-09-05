
"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { deleteDailyLog } from '@/app/actions';
import type { DailyLog } from '@/lib/types';
import EditDailyLogForm from './edit-daily-log-form';

type DailyLogDetailsClientProps = {
  initialLogs: DailyLog[];
};

export default function DailyLogDetailsClient({ initialLogs }: DailyLogDetailsClientProps) {
  const [logs, setLogs] = useState<DailyLog[]>(initialLogs);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  const handleEditClick = (log: DailyLog) => {
    setSelectedLog(log);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (log: DailyLog) => {
    setSelectedLog(log);
    setIsDeleteDialogOpen(true);
  };

  const handleLogUpdated = (updatedLog: DailyLog) => {
    setLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
    setIsEditDialogOpen(false);
    setSelectedLog(null);
  };

  const confirmDelete = async () => {
    if (!selectedLog) return;
    setIsDeleting(true);
    const result = await deleteDailyLog(selectedLog.id);
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: "Log Deleted",
        description: "The daily log has been successfully deleted.",
      });
      setLogs(prev => prev.filter(l => l.id !== selectedLog.id));
      setIsDeleteDialogOpen(false);
      setSelectedLog(null);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daily Log Details</CardTitle>
          <CardDescription>
            A log of all daily bus operational data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bus Number</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(parseISO(entry.date), 'PPP')}</TableCell>
                  <TableCell className="font-medium">
                    {entry.busNumber}
                  </TableCell>
                  <TableCell>{entry.startTime}</TableCell>
                  <TableCell>{entry.endTime}</TableCell>
                  <TableCell>{entry.notes || 'N/A'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(entry)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(entry)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No daily logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Daily Log</DialogTitle>
            <DialogDescription>
              Update the details for the selected daily log.
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <EditDailyLogForm log={selectedLog} onLogUpdated={handleLogUpdated} />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this daily log entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
