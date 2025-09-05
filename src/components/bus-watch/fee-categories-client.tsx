
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
import { FileBox, PlusCircle, IndianRupee, MoreVertical, Loader2, Trash } from 'lucide-react';
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
import type { FeeCategory, SchoolFee, VillageFee } from '@/lib/types';
import AddFeeCategoryForm from './add-fee-category-form';
import EditFeeCategoryForm from './edit-fee-category-form';
import { toast } from '@/hooks/use-toast';
import { addFeeCategoryAction, updateFeeCategoryAction, deleteFeeCategoryAction } from '@/app/actions';
import { Badge } from '../ui/badge';

type FeeCategoriesClientProps = {
  initialCategories: FeeCategory[];
  schoolFees: SchoolFee[];
  villageFees: VillageFee[];
};

export default function FeeCategoriesClient({ initialCategories, schoolFees, villageFees }: FeeCategoriesClientProps) {
  const [categories, setCategories] = useState<FeeCategory[]>(initialCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FeeCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddCategory = async (values: Omit<FeeCategory, 'id'>) => {
    const result = await addFeeCategoryAction(values);
    if (result.success) {
      setCategories(prev => [...prev, result.data]);
      toast({
        title: 'Category Added',
        description: `Successfully added category: ${values.name}.`,
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

  const handleEditClick = (category: FeeCategory) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };
  
  const handleCategoryUpdated = async (updatedCategory: FeeCategory) => {
    const result = await updateFeeCategoryAction(updatedCategory);
     if (result.success) {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
        toast({
            title: "Category Updated",
            description: `Successfully updated category: ${updatedCategory.name}.`
        });
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
     } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error
        });
     }
  };

  const handleDeleteClick = (category: FeeCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  }

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    setIsDeleting(true);
    const result = await deleteFeeCategoryAction(selectedCategory.id);
    setIsDeleting(false);

    if(result.success) {
        toast({
            title: "Category Deleted",
            description: `Category "${selectedCategory.name}" has been deleted.`
        });
        setCategories(prev => prev.filter(f => f.id !== selectedCategory.id));
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
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
              <FileBox className="h-5 w-5 text-primary" />
              Fee Categories
            </CardTitle>
            <CardDescription>
              Manage additional fee categories like fines or special charges.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Fee Category</DialogTitle>
                <DialogDescription>
                  Define a new category for fee collection.
                </DialogDescription>
              </DialogHeader>
              <AddFeeCategoryForm 
                onAddCategory={handleAddCategory} 
                schoolFees={schoolFees}
                villageFees={villageFees}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Village</TableHead>
                <TableHead className="text-right">Default Amount (₹)</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.class ? <Badge variant="outline">{category.class}</Badge> : 'N/A'}</TableCell>
                  <TableCell>{category.village ? <Badge variant="outline">{category.village}</Badge> : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {category.defaultAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(category)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(category)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No custom fee categories have been added yet.
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
            <DialogTitle>Edit Fee Category</DialogTitle>
            <DialogDescription>
              Update the details for the "{selectedCategory?.name}" category.
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <EditFeeCategoryForm 
                category={selectedCategory} 
                onUpdateCategory={handleCategoryUpdated} 
                schoolFees={schoolFees}
                villageFees={villageFees}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the fee category <span className="font-semibold">"{selectedCategory?.name}"</span>.
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
