// Factory Method Pattern implementation for product creation
// This allows for flexible product instantiation based on type

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  specifications: Record<string, any>;
  getDescription(): string;
}

// Concrete products
export class RegulatorProduct implements Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  specifications: Record<string, any>;

  constructor(id: string, name: string, brand: string, price: number, specs: Record<string, any>) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.price = price;
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
  specifications: Record<string, any>;

  constructor(id: string, name: string, brand: string, price: number, specs: Record<string, any>) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.price = price;
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
  specifications: Record<string, any>;

  constructor(id: string, name: string, brand: string, price: number, specs: Record<string, any>) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.price = price;
    this.specifications = specs;
  }

  getDescription(): string {
    return `${this.brand} ${this.name} - High-performance fins for optimal propulsion`;
  }
}

// Product Factory that creates different product types
export class ProductFactory {
  createProduct(
    type: 'regulator' | 'bcd' | 'fin',
    id: string,
    name: string,
    brand: string,
    price: number,
    specs: Record<string, any>
  ): Product {
    switch (type) {
      case 'regulator':
        return new RegulatorProduct(id, name, brand, price, specs);
      case 'bcd':
        return new BCDProduct(id, name, brand, price, specs);
      case 'fin':
        return new FinProduct(id, name, brand, price, specs);
      default:
        throw new Error(`Product type ${type} is not supported`);
    }
  }
} 