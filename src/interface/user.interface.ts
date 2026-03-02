import type { Sector } from "./sector.interface";

export interface User {
    id: string;
    fullName: string;
    employeeNumber: string;
    nationalId: string;
    isActive: boolean;
    isSuperUser: boolean;
    roles: string[];
    sectorId?: string | null;
    sector?: Sector | null;
    currentWeekExtraOrders?: number | null;
    currentWeekOrdersCount?: number | null;
}

