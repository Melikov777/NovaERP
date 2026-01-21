export interface BaseEntity {
    id: number;
    createdAt: string;
    updatedAt?: string;
}

export interface Category extends BaseEntity {
    name: string;
    description?: string;
}

export interface Product extends BaseEntity {
    name: string;
    description?: string;
    sku?: string;
    price: number;
    cost: number;
    stockQuantity: number;
    minStockLevel: number;
    isActive: boolean;
    categoryId: number;
    category?: Category;
}

export interface SaleItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export enum SaleStatus {
    Pending = 0,
    Completed = 1,
    Cancelled = 2
}

export interface Sale {
    id: number;
    saleNumber: string;
    saleDate: string;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    status: SaleStatus;
    notes?: string;
    customerId: number;
    customerName?: string;
    saleItems: SaleItem[];
}

export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive: boolean;
}

export interface AuthResponse {
    token: string;
    email: string;
    roles: string[];
    permissions: string[];
    expiresAt: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface UserDto {
    id: string;
    email: string;
    roles: string[];
}
