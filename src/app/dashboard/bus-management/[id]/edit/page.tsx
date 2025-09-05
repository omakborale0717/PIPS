
import { getStudentsAction, getVillageFeesAction } from "@/app/actions";
import EditStudentForm from "@/components/bus-watch/edit-student-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notFound } from "next/navigation";

export default async function EditStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const studentId = params.id;
  const allStudents = await getStudentsAction();
  const villageFees = await getVillageFeesAction();
  const student = allStudents.find((s) => s.id === studentId);

  if (!student) {
    notFound();
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Student Details</CardTitle>
            <CardDescription>
              Update the information for {student.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditStudentForm student={student} villageFees={villageFees} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
