
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
  DialogTrigger,
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
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Wrench, PlusCircle, MoreVertical, Loader2, Trash, IndianRupee } from 'lucide-react';
import type { BusRoute, ServiceHistory } from '@/lib/types';
import AddRepairForm from '@/components/bus-watch/add-repair-form';
import { addServiceHistory, updateServiceHistory, deleteServiceHistory } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import EditRepairForm from './edit-repair-form';

type BusRepairClientProps = {
    initialBusRoutes: BusRoute[];
};

export default function BusRepairClient({ initialBusRoutes }: BusRepairClientProps) {
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(initialBusRoutes);
  const [selectedBusId, setSelectedBusId] = useState<string | undefined>(initialBusRoutes[0]?.id);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedHistory, setSelectedHistory] = useState<ServiceHistory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    setBusRoutes(initialBusRoutes);
    if (!selectedBusId && initialBusRoutes.length > 0) {
      setSelectedBusId(initialBusRoutes[0].id);
    }
  }, [initialBusRoutes, selectedBusId]);

  const selectedBus = useMemo(() => {
    return busRoutes.find(b => b.id === selectedBusId);
  }, [busRoutes, selectedBusId]);

  const serviceHistoryArray = useMemo((): ServiceHistory[] => {
    if (!selectedBus || !selectedBus.serviceHistory) return [];
    return Object.entries(selectedBus.serviceHistory).map(([id, history]) => ({
      id,
      ...history,
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedBus]);

  
  const handleAddRepair = async (busId: string, newService: Omit<ServiceHistory, 'id'|'date'> & {date: Date}) => {
    const serviceToAdd = {
        ...newService,
        date: newService.date.toISOString(),
    }
    const result = await addServiceHistory(busId, serviceToAdd);

    if(result.success) {
        setBusRoutes(prevRoutes =>
            prevRoutes.map(route => {
                if (route.id === busId) {
                    const newHistory = { ...route.serviceHistory, [result.data.id]: serviceToAdd };
                    return { ...route, serviceHistory: newHistory };
                }
                return route;
            })
        );
        toast({
            title: "Repair Logged",
            description: `Successfully logged a repair for bus.`
        });
        setIsAddDialogOpen(false);
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
        });
    }
  };

  const handleUpdateRepair = async (busId: string, updatedHistory: ServiceHistory) => {
    const result = await updateServiceHistory(busId, updatedHistory);
    if(result.success) {
      setBusRoutes(prevRoutes =>
        prevRoutes.map(route => {
          if (route.id === busId) {
            const updatedServiceHistory = { ...route.serviceHistory, [updatedHistory.id]: updatedHistory };
            return { ...route, serviceHistory: updatedServiceHistory };
          }
          return route;
        })
      );
      toast({ title: "Repair Updated", description: "Successfully updated repair entry." });
      setIsEditDialogOpen(false);
      setSelectedHistory(null);
    } else {
       toast({ variant: "destructive", title: "Error", description: result.error });
    }
  }
  
  const handleDeleteRepair = async () => {
    if(!selectedBus || !selectedHistory) return;

    setIsDeleting(true);
    const result = await deleteServiceHistory(selectedBus.id, selectedHistory.id);
    setIsDeleting(false);

    if(result.success) {
        setBusRoutes(prevRoutes =>
            prevRoutes.map(route => {
                if (route.id === selectedBus.id && route.serviceHistory) {
                    const newHistory = {...route.serviceHistory};
                    delete newHistory[selectedHistory.id];
                    return { ...route, serviceHistory: newHistory };
                }
                return route;
            })
        );
        toast({ title: "Repair Deleted", description: "Successfully deleted repair entry." });
        setIsDeleteDialogOpen(false);
        setSelectedHistory(null);
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
  }


  const openEditDialog = (history: ServiceHistory) => {
    setSelectedHistory(history);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (history: ServiceHistory) => {
    setSelectedHistory(history);
    setIsDeleteDialogOpen(true);
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Bus Repair Management</CardTitle>
            <CardDescription>
              Select a bus to view and manage its service history.
            </CardDescription>
          </div>
           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                Add Repair Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[650px]">
              <DialogHeader>
                <DialogTitle>Add New Bus Repair Details</DialogTitle>
                <DialogDescription>
                  Fill out the form below to log a new service event for a bus.
                </DialogDescription>
              </DialogHeader>
              <AddRepairForm onAddRepair={handleAddRepair} busRoutes={busRoutes} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
            <div className="max-w-xs mb-6">
                 <Label htmlFor="bus-select">Select a Bus</Label>
                <Select
                    value={selectedBusId}
                    onValueChange={(value) => setSelectedBusId(value)}
                >
                    <SelectTrigger id="bus-select">
                        <SelectValue placeholder="Select a bus..." />
                    </SelectTrigger>
                    <SelectContent>
                        {busRoutes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                            {route.busNumber} ({route.driverName})
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedBus ? (
                 <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Service Date</TableHead>
                        <TableHead>Machine / Part</TableHead>
                        <TableHead>Remark</TableHead>
                        <TableHead className="text-right">Total Cost (₹)</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {serviceHistoryArray.map((history) => (
                            <TableRow key={history.id}>
                                <TableCell>{format(parseISO(history.date), 'PPP')}</TableCell>
                                <TableCell>{history.machineName}</TableCell>
                                <TableCell>{history.remark}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {(history.labourCharge + history.totalRepairCharge).toLocaleString()}
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
                                            <DropdownMenuItem onClick={() => openEditDialog(history)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                            onClick={() => openDeleteDialog(history)}
                                            className="text-destructive"
                                            >
                                            Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {serviceHistoryArray.length === 0 && (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    No service history found for this bus.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <Wrench className="mx-auto h-12 w-12" />
                    <p className="mt-4">Please select a bus to see its repair history.</p>
                </div>
            )}
        </CardContent>
      </Card>

    {/* Edit Dialog */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[650px]">
            <DialogHeader>
            <DialogTitle>Edit Repair Details</DialogTitle>
            <DialogDescription>
                Update the details for the selected service entry.
            </DialogDescription>
            </DialogHeader>
            {selectedHistory && selectedBus && (
                <EditRepairForm
                    bus={selectedBus}
                    history={selectedHistory}
                    onUpdateRepair={handleUpdateRepair}
                />
            )}
        </DialogContent>
    </Dialog>

    {/* Delete Alert Dialog */}
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete this service record from {format(parseISO(selectedHistory?.date || new Date().toISOString()), 'PPP')}. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedHistory(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRepair} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}

    