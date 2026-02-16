export interface User {
    id: string;
    fullName: string;
    employeeNumber: string;
    nationalId: string;
    isActive: boolean;
    isSuperUser: boolean;
    roles: string[];
}

