import type { User } from "@/interface/user.interface";


// Login, Register, CheckStatus
export interface AuthResponse {
    user:  User;
    token: string;
}
