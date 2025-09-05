
"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { MoreVertical, PlusCircle, Trash, Loader2 } from 'lucide-react';
import type { BusRoute } from '@/lib/types';
import { deleteBusRoute, updateBusRoute } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import EditRouteForm from './edit-route-form';
import Link from 'next/link';

type RoutesClientProps = {
  initialRoutes: BusRoute[];
};

export default function RoutesClient({ initialRoutes }: RoutesClientProps) {
  const [routes, setRoutes] = useState<BusRoute[]>(initialRoutes);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (route: BusRoute) => {
    setSelectedRoute(route);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (route: BusRoute) => {
    setSelectedRoute(route);
    setIsDeleteDialogOpen(true);
  };

  const handleRouteUpdated = (updatedRoute: BusRoute) => {
    setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
    setIsEditDialogOpen(false);
    setSelectedRoute(null);
  };

  const confirmDelete = async () => {
    if (!selectedRoute) return;

    setIsDeleting(true);
    const result = await deleteBusRoute(selectedRoute.id);
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: "Route Deleted",
        description: "The bus route has been successfully deleted.",
      });
      setRoutes(prev => prev.filter(r => r.id !== selectedRoute.id));
      setIsDeleteDialogOpen(false);
      setSelectedRoute(null);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Bus Routes</CardTitle>
            <CardDescription>Manage all the bus routes in the system.</CardDescription>
        </div>
         <Button asChild>
            <Link href="/dashboard/add-route">
                <PlusCircle className="mr-2" />
                Add Route
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bus Number</TableHead>
              <TableHead>Driver Name</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell className="font-medium">{route.busNumber}</TableCell>
                <TableCell>{route.driverName}</TableCell>
                <TableCell>{route.route}</TableCell>
                <TableCell>{route.contact}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(route)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(route)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {routes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No bus routes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bus Route</DialogTitle>
            <DialogDescription>
              Update the details for the selected bus route.
            </DialogDescription>
          </DialogHeader>
          {selectedRoute && (
            <EditRouteForm route={selectedRoute} onRouteUpdated={handleRouteUpdated} />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bus route
              for <span className="font-semibold">{selectedRoute?.driverName}</span>.
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

    </Card>
  );
}
