
"use client";

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { MapPinned, PlusCircle, IndianRupee, MoreVertical, Loader2, Trash } from 'lucide-react';
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
import type { VillageFee } from '@/lib/types';
import AddVillageFeeForm from './add-village-fee-form';
import EditVillageFeeForm from './edit-village-fee-form';
import { toast } from '@/hooks/use-toast';
import { addVillageFeeAction, deleteVillageFeeAction } from '@/app/actions';

type VillageFeesClientProps = {
  initialFees: VillageFee[];
};

export default function VillageFeesClient({ initialFees }: VillageFeesClientProps) {
  const [fees, setFees] = useState<VillageFee[]>(initialFees);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<VillageFee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddFee = async (values: Omit<VillageFee, 'id'>) => {
    const result = await addVillageFeeAction(values);
    if (result.success) {
      setFees(prev => [...prev, result.data]);
      toast({
        title: 'Fee Added',
        description: `Successfully added fee for ${values.villageName}.`,
      });
      setIsAddDialogOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  const handleEditClick = (fee: VillageFee) => {
    setSelectedFee(fee);
    setIsEditDialogOpen(true);
  };
  
  const handleFeeUpdated = (updatedFee: VillageFee) => {
    setFees(prev => prev.map(f => f.id === updatedFee.id ? updatedFee : f));
    setIsEditDialogOpen(false);
    setSelectedFee(null);
  };

  const handleDeleteClick = (fee: VillageFee) => {
    setSelectedFee(fee);
    setIsDeleteDialogOpen(true);
  }

  const confirmDelete = async () => {
    if (!selectedFee) return;

    setIsDeleting(true);
    const result = await deleteVillageFeeAction(selectedFee.id);
    setIsDeleting(false);

    if(result.success) {
        toast({
            title: "Fee Deleted",
            description: `Fee for ${selectedFee.villageName} has been deleted.`
        });
        setFees(prev => prev.filter(f => f.id !== selectedFee.id));
        setIsDeleteDialogOpen(false);
        setSelectedFee(null);
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error
        });
    }
  }


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="h-6 w-6" />
              Village Fees Structure
            </CardTitle>
            <CardDescription>
              Define and manage bus fee structures based on village locations.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                Add Village Fee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Village Fee</DialogTitle>
                <DialogDescription>
                  Set a specific bus fee for a village.
                </DialogDescription>
              </DialogHeader>
              <AddVillageFeeForm onAddFee={handleAddFee} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Village Name</TableHead>
                <TableHead className="text-right">Fee Amount</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.villageName}</TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                     <IndianRupee className="h-4 w-4" /> 
                    {fee.feeAmount.toLocaleString()}
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
                        <DropdownMenuItem onClick={() => handleEditClick(fee)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(fee)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {fees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                    No village-specific fees have been added yet.
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
            <DialogTitle>Edit Village Fee</DialogTitle>
            <DialogDescription>
              Update the fee for {selectedFee?.villageName}.
            </DialogDescription>
          </DialogHeader>
          {selectedFee && <EditVillageFeeForm fee={selectedFee} onFeeUpdated={handleFeeUpdated} />}
        </DialogContent>
      </Dialog>
      
      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the fee for <span className="font-semibold">{selectedFee?.villageName}</span>.
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

    