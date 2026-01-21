// Based on Backend DTOs

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponseDto {
    token: string;
    email: string;
    roles: string[];
    expiration: string;
}

export interface ProductDto {
    id: int;
    name: string;
    description?: string;
    sku?: string;
    price: decimal;
    cost: decimal;
    stockQuantity: int;
    minStockLevel: int;
    isActive: boolean;
    categoryId: int;
    categoryName?: string;
}

export interface CreateProductDto {
    name: string;
    description?: string;
    sku?: string;
    price: decimal;
    cost: decimal;
    stockQuantity: int;
    minStockLevel?: int;
    isActive?: boolean;
    categoryId: int;
}

export interface UpdateProductDto {
    id: int;
    name: string;
    description?: string;
    sku?: string;
    price: decimal;
    cost: decimal;
    stockQuantity: int;
    minStockLevel: int;
    isActive: boolean;
    categoryId: int;
}

// Helper types for TS (since C# int/decimal map to number)
type int = number;
type decimal = number;
