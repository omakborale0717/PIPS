
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Arrival } from '@/lib/types';
import { PlusCircle, MoreVertical, Loader2, Trash, Calendar as CalendarIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import AddArrivalForm from '@/components/bus-watch/add-arrival-form';
import EditArrivalForm from '@/components/bus-watch/edit-arrival-form';
import { deleteArrival } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

type ArrivalTimesClientProps = {
  initialArrivals: Arrival[];
};

export default function ArrivalTimesClient({ initialArrivals }: ArrivalTimesClientProps) {
  const [arrivals, setArrivals] = useState<Arrival[]>(initialArrivals);
  
  const [isAddArrivalDialogOpen, setIsAddArrivalDialogOpen] = useState(false);
  const [isEditArrivalDialogOpen, setIsEditArrivalDialogOpen] = useState(false);
  const [isDeleteArrivalDialogOpen, setIsDeleteArrivalDialogOpen] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState<Arrival | null>(null);
  const [isDeletingArrival, setIsDeletingArrival] = useState(false);

  useEffect(() => {
    setArrivals(initialArrivals);
  }, [initialArrivals]);

  const handleArrivalAdded = (newArrival: Arrival) => {
    setArrivals(prev => [...prev, newArrival]);
    setIsAddArrivalDialogOpen(false);
  };

  const handleArrivalUpdated = (updatedArrival: Arrival) => {
    setArrivals(prev => prev.map(item => item.id === updatedArrival.id ? updatedArrival : item));
    setIsEditArrivalDialogOpen(false);
    setSelectedArrival(null);
  };

  const handleEditArrivalClick = (arrival: Arrival) => {
    setSelectedArrival(arrival);
    setIsEditArrivalDialogOpen(true);
  };

  const handleDeleteArrivalClick = (arrival: Arrival) => {
    setSelectedArrival(arrival);
    setIsDeleteArrivalDialogOpen(true);
  };

  const confirmDeleteArrival = async () => {
    if (!selectedArrival) return;
    setIsDeletingArrival(true);
    const result = await deleteArrival(selectedArrival.id);
    setIsDeletingArrival(false);

    if (result.success) {
      toast({
        title: "Arrival Deleted",
        description: `Successfully deleted the arrival for route ${selectedArrival.route}.`,
      });
      setArrivals(prev => prev.filter(item => item.id !== selectedArrival.id));
      setIsDeleteArrivalDialogOpen(false);
      setSelectedArrival(null);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };
  
    const getStatusColor = (status: Arrival['status']) => {
        switch (status) {
            case 'On Time':
            return 'bg-green-500';
            case 'Delayed':
            return 'bg-red-500';
            case 'Early':
            return 'bg-yellow-500';
            default:
            return 'bg-secondary';
        }
    };


  return (
    <>
      <div className="flex justify-end mb-4">
        <Dialog open={isAddArrivalDialogOpen} onOpenChange={setIsAddArrivalDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Add New Arrival
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Arrival Time</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new arrival time.
              </DialogDescription>
            </DialogHeader>
            <AddArrivalForm onArrivalAdded={handleArrivalAdded} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {arrivals.map((arrival) => (
            <TableRow key={arrival.id}>
              <TableCell>{format(parseISO(arrival.date), 'PPP')}</TableCell>
              <TableCell className="font-medium">{arrival.route}</TableCell>
              <TableCell>{arrival.destination}</TableCell>
              <TableCell>{arrival.time}</TableCell>
              <TableCell>
                <Badge
                  variant="default"
                  className={cn('text-white', getStatusColor(arrival.status))}
                >
                  {arrival.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditArrivalClick(arrival)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteArrivalClick(arrival)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
            {arrivals.length === 0 && (
              <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No arrival times found.
                  </TableCell>
              </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Edit Arrival Dialog */}
      <Dialog open={isEditArrivalDialogOpen} onOpenChange={setIsEditArrivalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Arrival Time</DialogTitle>
            <DialogDescription>
              Update the details for the selected arrival.
            </DialogDescription>
          </DialogHeader>
          {selectedArrival && <EditArrivalForm arrival={selectedArrival} onArrivalUpdated={handleArrivalUpdated} />}
        </DialogContent>
      </Dialog>
      
      {/* Delete Arrival Alert Dialog */}
      <AlertDialog open={isDeleteArrivalDialogOpen} onOpenChange={setIsDeleteArrivalDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the arrival entry
                      for route <span className="font-semibold">{selectedArrival?.route}</span>.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteArrival} disabled={isDeletingArrival} className="bg-destructive hover:bg-destructive/90">
                      {isDeletingArrival ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                      Delete
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
