// Factory Method Pattern implementation for product creation
// This allows for flexible product instantiation based on type

export interface Product {
  id: string;
  type: string;
  name: string;
  brand: string;
  price: number;
  specifications: Record<string, any>;
  imageUrl?: string;
  getDescription(): string;
}

// Concrete products
export class RegulatorProduct implements Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  type: string;
  specifications: Record<string, any>;
  imageUrl?: string;

  constructor(id: string, name: string, brand: string, price: number, specs: Record<string, any>) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.price = price;
    this.type = 'regulator';
    this.specifications = specs;
  }

  getDescription(): string {
    return `${this.brand} ${this.name} - A reliable regulator for your diving needs`;
  }
}

export class BCDProduct implements Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  type: string;
  specifications: Record<string, any>;
  imageUrl?: string;

  constructor(id: string, name: string, brand: string, price: number, specs: Record<string, any>) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.price = price;
    this.type = 'bcd';
    this.specifications = specs;
  }

  getDescription(): string {
    return `${this.brand} ${this.name} - A comfortable BCD with excellent buoyancy control`;
  }
}

export class FinProduct implements Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  type: string;
  specifications: Record<string, any>;
  imageUrl?: string;

  constructor(id: string, name: string, brand: string, price: number, specs: Record<string, any>) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.price = price;
    this.type = 'fin';
    this.specifications = specs;
  }

  getDescription(): string {
    return `${this.brand} ${this.name} - High-performance fins for optimal propulsion`;
  }
}

// Product Factory that creates different product types
export class ProductFactory {
  createProduct(
    type: string,
    id: string,
    name: string,
    brand: string,
    price: number,
    specifications: Record<string, any> = {},
    imageUrl?: string
  ): Product {
    return {
      id,
      type,
      name,
      brand,
      price,
      specifications,
      imageUrl,
      getDescription: () => `${brand} ${name} - ${type}`
    };
  }
} 