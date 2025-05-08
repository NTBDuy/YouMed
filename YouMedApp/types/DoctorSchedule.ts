export default interface DoctorSchedule {
    scheduleID: number;
    doctorID: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDuration: number;
    isActive: boolean;
    isRecurring: boolean;
    validFrom: string;
    validTo: string;
    createdAt: string;
    lastUpdated: string;
}