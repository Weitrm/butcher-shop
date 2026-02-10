import type { User } from "./user.interface";

export interface Product {
    id:          string;
    title:       string;
    price:       number;
    description: string;
    slug:        string;
    stock:       number;
    gender:      string;
    images:      string[];
    user:        User;
}

