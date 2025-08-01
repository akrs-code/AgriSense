import { ProductCondition } from "./enums";
import { Location } from "./location";

export interface CreateProductDTO {
    seller_id: string;
    name: string;
    variety: string | null;
    quantity: number;
    unit: string;
    price: number;
    description: string | null;
    harvest_date: Date;
    location: Location | null;
    category: string;
    images: string[] | null;
    condition: ProductCondition | null;
    is_active: boolean;
}

export interface Product {
    id: string;
    seller_id: string;
    name: string;
    variety: string | null;
    quantity: number;
    unit: string;
    price: number;
    description: string | null;
    harvest_date: Date;
    location: Location | null;
    category: string;
    images: string[] | null;
    condition: ProductCondition | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UpdateProductDTO {
    name?: string;
    variety?: string | null;
    quantity?: number;
    unit?: string;
    price?: number;
    description?: string | null;
    harvest_date?: Date;
    location?: Location | null;
    category?: string;
    images?: string[] | null;
    condition?: ProductCondition | null;
    is_active?: boolean;
}

