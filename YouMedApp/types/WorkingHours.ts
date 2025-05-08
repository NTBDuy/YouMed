export default interface WorkingHours {
    clinicWorkingHoursID?: number;
    clinicID?: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
    lastUpdated?: string;
}