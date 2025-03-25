/**
 * FilterFactory - Implements the Factory Method design pattern for product filters
 * Creates different specialized filter instances based on filter criteria
 */

// Filter interfaces
interface Filter {
  apply(products: any[]): any[];
}

// Concrete Filter implementations
class CategoryFilter implements Filter {
  constructor(private category: string) {}
  
  apply(products: any[]): any[] {
    return products.filter(product => product.category === this.category);
  }
}

class BrandFilter implements Filter {
  constructor(private brand: string) {}
  
  apply(products: any[]): any[] {
    return products.filter(product => product.brand === this.brand);
  }
}

class PriceFilter implements Filter {
  constructor(private priceRange: string) {}
  
  apply(products: any[]): any[] {
    let minPrice = 0;
    let maxPrice = Number.MAX_VALUE;
    
    switch (this.priceRange) {
      case '$0-$100':
        maxPrice = 100;
        break;
      case '$100-$300':
        minPrice = 100;
        maxPrice = 300;
        break;
      case '$300-$500':
        minPrice = 300;
        maxPrice = 500;
        break;
      case '$500+':
        minPrice = 500;
        break;
    }
    
    return products.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
  }
}

class ExperienceFilter implements Filter {
  constructor(private experienceLevel: string) {}
  
  apply(products: any[]): any[] {
    return products.filter(product => 
      product.experienceLevel === this.experienceLevel
    );
  }
}

class CompositeFilter implements Filter {
  private filters: Filter[] = [];
  
  addFilter(filter: Filter): void {
    this.filters.push(filter);
  }
  
  apply(products: any[]): any[] {
    return this.filters.reduce(
      (filteredProducts, filter) => filter.apply(filteredProducts),
      products
    );
  }
}

// The Factory class
export class FilterFactory {
  static createFilter(filterCriteria: Record<string, string>): Filter {
    const compositeFilter = new CompositeFilter();
    
    Object.entries(filterCriteria).forEach(([key, value]) => {
      if (!value) return;
      
      switch (key) {
        case 'Category':
          compositeFilter.addFilter(new CategoryFilter(value));
          break;
        case 'Brand':
          compositeFilter.addFilter(new BrandFilter(value));
          break;
        case 'Price':
          compositeFilter.addFilter(new PriceFilter(value));
          break;
        case 'Experience':
          compositeFilter.addFilter(new ExperienceFilter(value));
          break;
      }
    });
    
    return compositeFilter;
  }
  
  // Additional factory methods for specific filter types
  static createCategoryFilter(category: string): Filter {
    return new CategoryFilter(category);
  }
  
  static createBrandFilter(brand: string): Filter {
    return new BrandFilter(brand);
  }
  
  static createPriceFilter(priceRange: string): Filter {
    return new PriceFilter(priceRange);
  }
  
  static createExperienceFilter(experienceLevel: string): Filter {
    return new ExperienceFilter(experienceLevel);
  }
}
