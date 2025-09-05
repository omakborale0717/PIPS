
"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { format, parseISO, isSameDay } from 'date-fns';
import type { BusRoute, DieselEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Calendar as CalendarIcon, MoreVertical, Loader2, Trash } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { deleteDieselEntry } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import EditDieselEntryForm from './edit-diesel-entry-form';


type DieselManagementClientProps = {
  busRoutes: BusRoute[];
  dieselEntries: DieselEntry[];
};

export default function DieselManagementClient({ busRoutes, dieselEntries: initialDieselEntries }: DieselManagementClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dieselEntries, setDieselEntries] = useState<DieselEntry[]>(initialDieselEntries);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DieselEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    setDieselEntries(initialDieselEntries);
  }, [initialDieselEntries]);


  const filteredDieselEntries = useMemo(() => {
    if (!selectedDate) {
      return dieselEntries;
    }
    return dieselEntries.filter(entry => 
      entry.date && isSameDay(parseISO(entry.date), selectedDate)
    );
  }, [dieselEntries, selectedDate]);

  const handleEditClick = (entry: DieselEntry) => {
    setSelectedEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (entry: DieselEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEntryUpdated = (updatedEntry: DieselEntry) => {
    setDieselEntries(prev => prev.map(item => item.id === updatedEntry.id ? updatedEntry : item));
    setIsEditDialogOpen(false);
    setSelectedEntry(null);
  };
  
  const confirmDelete = async () => {
    if (!selectedEntry) return;
    setIsDeleting(true);
    const result = await deleteDieselEntry(selectedEntry.id);
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: "Entry Deleted",
        description: `Successfully deleted the diesel entry.`,
      });
      setDieselEntries(prev => prev.filter(item => item.id !== selectedEntry.id));
      setIsDeleteDialogOpen(false);
      setSelectedEntry(null);
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
          <CardTitle>Bus Fuel Levels</CardTitle>
          <CardDescription>An overview of the current fuel levels in each bus.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus Number</TableHead>
                <TableHead>Driver Name</TableHead>
                <TableHead>Fuel Level</TableHead>
                <TableHead>Last Refueled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {busRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.busNumber}</TableCell>
                  <TableCell>{route.driverName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={route.fuelLevel || 0} className="w-32" />
                      <span>{route.fuelLevel || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     {route.lastFueled ? format(parseISO(route.lastFueled), 'PPP') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
               {busRoutes.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No bus routes found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Diesel Refueling Log</CardTitle>
            <CardDescription>
              A log of all diesel refueling events. Filter by date.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button asChild>
              <Link href="/dashboard/diesel-entry">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Entry
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bus Number</TableHead>
                <TableHead>Diesel Pump Name</TableHead>
                <TableHead>Liters Added</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Page Number</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDieselEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date ? format(parseISO(entry.date), 'PPP') : 'N/A'}</TableCell>
                  <TableCell className="font-medium">
                    {entry.busNumber}
                  </TableCell>
                  <TableCell>{entry.pumpName}</TableCell>
                  <TableCell>{entry.liters.toFixed(2)}</TableCell>
                  <TableCell>{entry.amount.toLocaleString()}</TableCell>
                  <TableCell>{entry.pageNumber}</TableCell>
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
              {filteredDieselEntries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No diesel entries found for the selected date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Diesel Entry</DialogTitle>
            <DialogDescription>
              Update the details for the selected diesel refueling log.
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && <EditDieselEntryForm entry={selectedEntry} onEntryUpdated={handleEntryUpdated} />}
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this diesel entry.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                      {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                      Delete
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
