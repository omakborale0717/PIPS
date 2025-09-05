
export type Bus = {
  id: string;
  route: string;
  position: {
    lat: number;
    lng: number;
  };
  status: 'On Time' | 'Delayed' | 'Early';
};

export type BusStop = {
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  routes: string[];
};

export type Arrival = {
  id: string;
  route: string;
  destination: string;
  time: string;
  status: 'On Time' | 'Delayed' | 'Early';
  date: string; // ISO date string
};

export type ServiceHistory = {
    id: string;
    date: string;
    machineName: string;
    contactNumber: string;
    labourCharge: number;
    totalRepairCharge: number;
    remark: string;
}

export type BusRoute = {
    id: string;
    driverName: string;
    route: string;
    busNumber: string;
    contact: string;
    fuelLevel?: number;
    lastFueled?: string;
    serviceHistory?: Record<string, Omit<ServiceHistory, 'id'>>;
}

export type Student = {
    id: string;
    name: string;
    fatherName: string;
    class: string;
    section: string;
    busNumber?: string;
    fees?: number;
    village: string;
    parentContact: string;
    usesBus: boolean;
    lat?: number;
    lon?: number;
}

export type DieselEntry = {
    id: string;
    busNumber: string;
    pumpName: string;
    liters: number;
    amount: number;
    date: string;
    pageNumber: number;
}

export type DailyLog = {
    id: string;
    busNumber: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
}

export type BusFeePayment = {
    id: string;
    studentId: string;
    amountPaid: number;
    paymentDate: string;
    notes?: string;
}

export type VillageFee = {
    id: string;
    villageName: string;
    feeAmount: number;
}

export type SchoolFee = {
  id: string;
  class: string;
  term1: number;
  term2: number;
  total: number;
}

export type RealTimeBusLocation = {
    busId: string;
    lat: number;
    lon: number;
    timestamp: string;
}

export type GeneralSettings = {
  id: string;
  appTheme: "light" | "dark";
  notifications: boolean;
  currency: string;
}

export type BusFeesSettings = {
  id: string;
  monthlyFee: number;
  lateFee: number;
}

export type ProfileSettings = {
  id: string;
  schoolName: string;
  contactNumber: string;
  address: string;
}

    