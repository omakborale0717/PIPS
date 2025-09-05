

"use client";

import { useState } from 'react';
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
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StudentWithPaidFees } from '@/app/dashboard/bus-management/page';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { deleteStudent } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type BusManagementClientProps = {
  students: StudentWithPaidFees[];
};

export default function BusManagementClient({ students: initialStudents }: BusManagementClientProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentWithPaidFees[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBus, setSelectedBus] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentWithPaidFees | null>(null);

  const uniqueBuses = ['all', ...Array.from(new Set(students.filter(s => s.busNumber).map(s => s.busNumber!)))];

  const filteredStudents = students.filter(student => {
    const busMatch = selectedBus === 'all' || student.busNumber === selectedBus;
    const searchMatch = searchTerm === '' || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (student.fatherName && student.fatherName.toLowerCase().includes(searchTerm.toLowerCase()));
    return busMatch && searchMatch;
  });

  const handleDeleteClick = (student: StudentWithPaidFees) => {
    setStudentToDelete(student);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    const result = await deleteStudent(studentToDelete.id);
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: "Student Deleted",
        description: `${studentToDelete.name} has been removed from the system.`,
      });
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setStudentToDelete(null);
    } else {
      toast({
        variant: "destructive",
        title: "Error Deleting Student",
        description: result.error,
      });
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Student Details</CardTitle>
        <CardDescription>
          Filter students by bus number or search by name.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
           <div className="flex-1">
            <label htmlFor="search-filter" className="text-sm font-medium">Search by Name or Father's Name</label>
            <Input 
              id="search-filter"
              placeholder="Enter student or father name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="bus-filter" className="text-sm font-medium">Filter by Bus Number</label>
            <Select value={selectedBus} onValueChange={setSelectedBus}>
              <SelectTrigger id="bus-filter">
                <SelectValue placeholder="Select Bus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buses</SelectItem>
                {uniqueBuses.filter(b => b !== 'all').map(bus => (
                  <SelectItem key={bus} value={bus}>
                    {bus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Father's Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Bus Number</TableHead>
              <TableHead>Fees (₹)</TableHead>
              <TableHead>Total Paid (₹)</TableHead>
              <TableHead>Balance (₹)</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/bus-management/${student.id}`} className="hover:underline text-primary">
                    {student.name}
                  </Link>
                </TableCell>
                <TableCell>{student.fatherName}</TableCell>
                <TableCell>{student.class} '{student.section}'</TableCell>
                <TableCell>{student.busNumber || 'N/A'}</TableCell>
                <TableCell>{student.fees?.toLocaleString() || 'N/A'}</TableCell>
                 <TableCell className="font-semibold text-green-600">
                  {student.totalPaid.toLocaleString()}
                </TableCell>
                 <TableCell className={cn("font-semibold", student.balance > 0 ? "text-destructive" : "text-muted-foreground")}>
                  {student.balance.toLocaleString()}
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
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/bus-management/${student.id}/edit`)}>
                          <Pencil className="mr-2 h-4 w-4"/> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(student)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4"/> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No students found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the student record for <span className="font-semibold">{studentToDelete?.name}</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                    Delete Student
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
