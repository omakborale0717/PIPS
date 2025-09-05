
'use server';
import { analyzeBusDisruptions } from '@/ai/flows/analyze-bus-disruptions';
import { hashPassword } from '@/lib/crypto';
import type { Student, BusRoute, DieselEntry, DailyLog, Arrival, ServiceHistory, GeneralSettings, BusFeesSettings, ProfileSettings, BusFeePayment, VillageFee, SchoolFee } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase';
import { ref, get, set, push, remove, update } from 'firebase/database';
import initialData from '@/lib/data.json';

// Helper function to convert Realtime Database snapshot to array
function snapshotToData<T>(snapshot: any): T[] {
    const data: T[] = [];
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot: any) => {
            data.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
    }
    return data;
}

// Helper function to convert single RTDB snapshot to data
function singleSnapshotToData<T>(snapshot: any): T | null {
    if (snapshot.exists()) {
        return { id: snapshot.key, ...snapshot.val() };
    }
    return null;
}

export async function seedDatabaseAction() {
    try {
        // In RTDB, `set` at the root will overwrite everything.
        // We will set the entire initialData structure.
        await set(ref(db), initialData);

        revalidatePath('/'); // Revalidate all paths to be safe
        return { success: true, message: "Database seeded successfully!" };
    } catch (error) {
        console.error("Error seeding database:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "An unknown error occurred while seeding the database." };
    }
}


export async function getStudentsAction(): Promise<Student[]> {
    const studentsRef = ref(db, 'students');
    const snapshot = await get(studentsRef);
    return snapshotToData<Student>(snapshot);
}

export async function getBusRoutesAction(): Promise<BusRoute[]> {
    const routesRef = ref(db, 'busRoutes');
    const snapshot = await get(routesRef);
    return snapshotToData<BusRoute>(snapshot);
}

export async function getDieselEntriesAction(): Promise<DieselEntry[]> {
    const entriesRef = ref(db, 'dieselEntries');
    const snapshot = await get(entriesRef);
    return snapshotToData<DieselEntry>(snapshot);
}

export async function getDailyLogsAction(): Promise<DailyLog[]> {
    const logsRef = ref(db, 'dailyLogs');
    const snapshot = await get(logsRef);
    return snapshotToData<DailyLog>(snapshot);
}

export async function getArrivalsAction(): Promise<Arrival[]> {
    const arrivalsRef = ref(db, 'arrivals');
    const snapshot = await get(arrivalsRef);
    return snapshotToData<Arrival>(snapshot);
}

export async function getVillageFeesAction(): Promise<VillageFee[]> {
    const feesRef = ref(db, 'villageFees');
    const snapshot = await get(feesRef);
    return snapshotToData<VillageFee>(snapshot);
}

export async function getSchoolFeesAction(): Promise<SchoolFee[]> {
    const feesRef = ref(db, 'schoolFees');
    const snapshot = await get(feesRef);
    return snapshotToData<SchoolFee>(snapshot);
}


export async function getBusFeePaymentsAction(): Promise<BusFeePayment[]> {
    const paymentsRef = ref(db, 'busFeePayments');
    const snapshot = await get(paymentsRef);
    return snapshotToData<BusFeePayment>(snapshot);
}


export async function getDisruptionAnalysis() {
  try {
    const routes = await getBusRoutesAction();
    const result = await analyzeBusDisruptions({
      realTimeBusLocations: JSON.stringify(routes.map(r => ({busId: r.busNumber, lat: 0, lon: 0}))), // Placeholder
      historicalData: 'Historical data not available from Firestore yet.',
      newsFeed: 'News feed not available from Firestore yet.',
    });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to analyze disruptions.' };
  }
}

export async function getHashedPassword(password: string) {
    return hashPassword(password);
}

export async function addStudent(student: Omit<Student, 'id'>) {
    try {
        const studentsRef = ref(db, 'students');
        const newStudentRef = push(studentsRef);
        await set(newStudentRef, student);
        const newStudentId = newStudentRef.key;
        
        revalidatePath('/dashboard/bus-management');
        revalidatePath('/dashboard/student-entry');
        return { success: true, data: {id: newStudentId!, ...student} };
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to add student.' };
    }
}

export async function updateStudent(student: Student) {
    try {
        const studentRef = ref(db, `students/${student.id}`);
        const { id, ...studentData } = student;
        await update(studentRef, studentData);

        revalidatePath(`/dashboard/bus-management/${id}`);
        revalidatePath('/dashboard/bus-management');
        return { success: true, data: student };
    } catch (error) {
        console.error('Error updating student:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to update student.' };
    }
}

export async function deleteStudent(studentId: string) {
    try {
        const studentRef = ref(db, `students/${studentId}`);
        await remove(studentRef);

        revalidatePath('/dashboard/bus-management');
        return { success: true, data: { id: studentId } };
    } catch (error) {
        console.error('Error deleting student:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to delete student.' };
    }
}


export async function addBusRoute(route: Omit<BusRoute, 'id'>) {
    try {
        const busRoutesRef = ref(db, 'busRoutes');
        const newBusRouteRef = push(busRoutesRef);
        await set(newBusRouteRef, route);
        const newBusRouteId = newBusRouteRef.key;

        revalidatePath('/dashboard/routes');
        revalidatePath('/dashboard/add-route');
        return { success: true, data: {id: newBusRouteId!, ...route } };
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to add bus route.' };
    }
}

export async function updateBusRoute(route: BusRoute) {
    try {
        const routeRef = ref(db, `busRoutes/${route.id}`);
        const { id, ...routeData } = route;
        await update(routeRef, routeData);

        revalidatePath('/dashboard/settings');
        revalidatePath('/dashboard/routes');
        return { success: true, data: route };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to update bus route.' };
    }
}


export async function deleteBusRoute(routeId: string) {
    try {
        const routeRef = ref(db, `busRoutes/${routeId}`);
        await remove(routeRef);

        revalidatePath('/dashboard/settings');
        revalidatePath('/dashboard/routes');
        return { success: true, data: { id: routeId } };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to delete a bus route.' };
    }
}

export async function addDailyLog(log: Omit<DailyLog, 'id' | 'date'> & { date: Date }) {
    try {
        const newLogData = {
            ...log,
            date: log.date.toISOString(),
        };
        const dailyLogsRef = ref(db, 'dailyLogs');
        const newDailyLogRef = push(dailyLogsRef);
        await set(newDailyLogRef, newLogData);

        revalidatePath('/dashboard/daily-log-details');
        return { success: true, data: { id: newDailyLogRef.key!, ...newLogData } };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to add daily log.' };
    }
}

export async function updateDailyLog(log: DailyLog) {
    try {
        const logRef = ref(db, `dailyLogs/${log.id}`);
        const { id, ...logData } = log;
        await update(logRef, logData);

        revalidatePath('/dashboard/daily-log-details');
        return { success: true, data: log };
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to update daily log.' };
    }
}

export async function deleteDailyLog(logId: string) {
    try {
        const logRef = ref(db, `dailyLogs/${logId}`);
        await remove(logRef);
        revalidatePath('/dashboard/daily-log-details');
        return { success: true, data: { id: logId } };
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to delete daily log.' };
    }
}


export async function addDieselEntry(entry: Omit<DieselEntry, 'id' | 'date'> & { date: Date }) {
    try {
         const newEntryData = {
            ...entry,
            date: entry.date.toISOString(),
        };
        const dieselEntriesRef = ref(db, 'dieselEntries');
        const newDieselEntryRef = push(dieselEntriesRef);
        await set(newDieselEntryRef, newEntryData);
        revalidatePath('/dashboard/diesel');
        return { success: true, data: {id: newDieselEntryRef.key!, ...newEntryData } };
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to add diesel entry.' };
    }
}

export async function updateDieselEntry(entry: DieselEntry) {
    try {
        const entryRef = ref(db, `dieselEntries/${entry.id}`);
        const { id, ...entryData } = entry;
        await update(entryRef, entryData);

        revalidatePath('/dashboard/diesel');
        return { success: true, data: entry };
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to update diesel entry.' };
    }
}

export async function deleteDieselEntry(entryId: string) {
    try {
        const entryRef = ref(db, `dieselEntries/${entryId}`);
        await remove(entryRef);
        revalidatePath('/dashboard/diesel');
        return { success: true, data: { id: entryId } };
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to delete diesel entry.' };
    }
}


export async function addArrival(arrival: Omit<Arrival, 'id' | 'date'> & { date: Date }) {
    try {
        const newArrivalData = {
            ...arrival,
            date: arrival.date.toISOString(),
        };
        const arrivalsRef = ref(db, 'arrivals');
        const newArrivalRef = push(arrivalsRef);
        await set(newArrivalRef, newArrivalData);

        revalidatePath('/dashboard/settings');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/arrival-times');

        return { success: true, data: { id: newArrivalRef.key!, ...newArrivalData } };
    } catch (error)
        {
        console.error(error);
        return { success: false, error: 'Failed to add arrival.' };
    }
}

export async function updateArrival(arrival: Arrival) {
    try {
        const arrivalRef = ref(db, `arrivals/${arrival.id}`);
        const { id, ...arrivalData } = arrival;
        await update(arrivalRef, arrivalData);

        revalidatePath('/dashboard/settings');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/arrival-times');

        return { success: true, data: arrival };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to update arrival.' };
    }
}

export async function deleteArrival(arrivalId: string) {
    try {
        const arrivalRef = ref(db, `arrivals/${arrivalId}`);
        await remove(arrivalRef);
        revalidatePath('/dashboard/settings');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/arrival-times');
        return { success: true, data: { id: arrivalId } };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to delete arrival.' };
    }
}

export async function addServiceHistory(busId: string, serviceHistory: Omit<ServiceHistory, 'id'>) {
    try {
        const serviceHistoryRef = ref(db, `busRoutes/${busId}/serviceHistory`);
        const newServiceHistoryRef = push(serviceHistoryRef);
        await set(newServiceHistoryRef, serviceHistory);

        revalidatePath('/dashboard/bus-repair');
        return { success: true, data: { id: newServiceHistoryRef.key!, ...serviceHistory } };

    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to add service history.' };
    }
}

export async function updateServiceHistory(busId: string, serviceHistory: ServiceHistory) {
    try {
        const serviceHistoryRef = ref(db, `busRoutes/${busId}/serviceHistory/${serviceHistory.id}`);
        const { id, ...serviceData } = serviceHistory;
        await update(serviceHistoryRef, serviceData);
        revalidatePath('/dashboard/bus-repair');
        return { success: true, data: serviceHistory };
    } catch (error) {
        console.error('Error updating service history:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to update service history.' };
    }
}

export async function deleteServiceHistory(busId: string, serviceHistoryId: string) {
    try {
        const serviceHistoryRef = ref(db, `busRoutes/${busId}/serviceHistory/${serviceHistoryId}`);
        await remove(serviceHistoryRef);
        revalidatePath('/dashboard/bus-repair');
        return { success: true, data: { id: serviceHistoryId } };
    } catch (error) {
        console.error('Error deleting service history:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to delete service history.' };
    }
}


export async function addBusFeePayment(payment: Omit<BusFeePayment, 'id' | 'paymentDate'> & { paymentDate: Date }) {
    try {
        const newPaymentData = {
            ...payment,
            paymentDate: payment.paymentDate.toISOString(),
        };
        const paymentsRef = ref(db, 'busFeePayments');
        const newPaymentRef = push(paymentsRef);
        await set(newPaymentRef, newPaymentData);

        revalidatePath('/dashboard/bus-fees-paid');
        // In the future, we might have a page to show payment history
        // revalidatePath('/dashboard/bus-fees-history');
        
        return { success: true, data: { id: newPaymentRef.key!, ...newPaymentData } };
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to log bus fee payment.' };
    }
}

export async function addVillageFeeAction(fee: Omit<VillageFee, 'id'>) {
    try {
        const villageFeesRef = ref(db, 'villageFees');
        const newVillageFeeRef = push(villageFeesRef);
        await set(newVillageFeeRef, fee);
        const newVillageFeeId = newVillageFeeRef.key;

        revalidatePath('/dashboard/village-fees');
        revalidatePath('/dashboard/settings');
        return { success: true, data: { id: newVillageFeeId!, ...fee } };
    } catch (error) {
        console.error('Error adding village fee:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to add village fee.' };
    }
}

export async function updateVillageFeeAction(fee: VillageFee) {
    try {
        const feeRef = ref(db, `villageFees/${fee.id}`);
        const { id, ...feeData } = fee;
        await update(feeRef, feeData);
        revalidatePath('/dashboard/village-fees');
        revalidatePath('/dashboard/settings');
        return { success: true, data: fee };
    } catch (error) {
        console.error('Error updating village fee:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to update village fee.' };
    }
}

export async function deleteVillageFeeAction(feeId: string) {
    try {
        const feeRef = ref(db, `villageFees/${feeId}`);
        await remove(feeRef);
        revalidatePath('/dashboard/village-fees');
        revalidatePath('/dashboard/settings');
        return { success: true, data: { id: feeId } };
    } catch (error) {
        console.error('Error deleting village fee:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to delete village fee.' };
    }
}

export async function addSchoolFeeAction(fee: Omit<SchoolFee, 'id'>) {
    try {
        const schoolFeesRef = ref(db, 'schoolFees');
        const newSchoolFeeRef = push(schoolFeesRef);
        await set(newSchoolFeeRef, fee);
        const newSchoolFeeId = newSchoolFeeRef.key;

        revalidatePath('/dashboard/settings');
        return { success: true, data: { id: newSchoolFeeId!, ...fee } };
    } catch (error) {
        console.error('Error adding school fee:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Failed to add school fee.' };
    }
}


export async function getGeneralSettingsAction(): Promise<GeneralSettings | null> {
    const settingsRef = ref(db, 'settings/general');
    const snapshot = await get(settingsRef);
    return singleSnapshotToData<GeneralSettings>(snapshot);
}

export async function getBusFeesSettingsAction(): Promise<BusFeesSettings | null> {
     const settingsRef = ref(db, 'settings/busFees');
    const snapshot = await get(settingsRef);
    return singleSnapshotToData<BusFeesSettings>(snapshot);
}

export async function getProfileSettingsAction(): Promise<ProfileSettings | null> {
    const settingsRef = ref(db, 'settings/profile');
    const snapshot = await get(settingsRef);
    return singleSnapshotToData<ProfileSettings>(snapshot);
}

export async function getAllDataAsJsonAction() {
    try {
        const dbRef = ref(db);
        const snapshot = await get(dbRef);
        const allData = snapshot.val();

        return { success: true, data: JSON.stringify(allData, null, 2) };
    } catch (error) {
        console.error('Error exporting all data to JSON:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'An unknown error occurred while exporting data.' };
    }
}

    

    