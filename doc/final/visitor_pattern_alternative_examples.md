# Alternative Visitor Pattern Examples for ScubaDivingApp

## Overview of Visitor Pattern

The Visitor design pattern separates algorithms from the objects they operate on, allowing new operations to be added to existing object structures without modifying them. In the ScubaDivingApp, while the current implementation focuses on price calculation and recommendations, the pattern can be extended with several other powerful applications.

## Core Pattern Structure (Same Across All Applications)

The foundation of the Visitor pattern remains consistent:

```typescript
// Visitor interface
export interface ProductVisitor {
  visitRegulator(product: RegulatorProduct): any;
  visitBCD(product: BCDProduct): any;
  visitFin(product: FinProduct): any;
}

// Visitable interface
export interface VisitableProduct extends Product {
  accept(visitor: ProductVisitor): any;
}

// Concrete visitable products
export class VisitableRegulatorProduct extends RegulatorProduct implements VisitableProduct {
  accept(visitor: ProductVisitor): any {
    return visitor.visitRegulator(this);
  }
}
// ... similarly for BCD and Fin products
```

## Alternative Visitor Implementations

### 1. Technical Specifications Formatter Visitor

A visitor that formats technical specifications differently for each product type, creating user-friendly displays:

```typescript
export class TechnicalSpecsFormatterVisitor implements ProductVisitor {
  visitRegulator(product: RegulatorProduct): string[] {
    const specs = [];
    
    // Format regulator-specific specs
    if (product.specifications.temperature) {
      specs.push(`Water Temperature: ${product.specifications.temperature}`);
    }
    
    if (product.specifications.high_pressure_port) {
      specs.push(`HP Ports: ${product.specifications.high_pressure_port}`);
    }
    
    if (product.specifications.low_pressure_port) {
      specs.push(`LP Ports: ${product.specifications.low_pressure_port}`);
    }
    
    if (product.specifications.adjustable_airflow) {
      specs.push(`Adjustable Airflow: ${product.specifications.adjustable_airflow}`);
    }
    
    return specs;
  }
  
  visitBCD(product: BCDProduct): string[] {
    const specs = [];
    
    // Format BCD-specific specs
    if (product.specifications.type) {
      specs.push(`Style: ${product.specifications.type}`);
    }
    
    if (product.specifications.weight_pocket) {
      specs.push(`Weight Pockets: ${product.specifications.weight_pocket}`);
    }
    
    if (product.specifications.weight_kg) {
      specs.push(`Weight: ${product.specifications.weight_kg} kg`);
    }
    
    if (product.specifications.lift_capacity_base_on_largest_size_kg) {
      specs.push(`Lift Capacity: ${product.specifications.lift_capacity_base_on_largest_size_kg} kg`);
    }
    
    return specs;
  }
  
  visitFin(product: FinProduct): string[] {
    const specs = [];
    
    // Format fin-specific specs
    if (product.specifications.material) {
      specs.push(`Material: ${product.specifications.material}`);
    }
    
    if (product.specifications.style) {
      specs.push(`Style: ${product.specifications.style === 'open' ? 'Open Heel' : 'Full Foot'}`);
    }
    
    if (product.specifications.stiffness) {
      specs.push(`Stiffness: ${product.specifications.stiffness}`);
    }
    
    return specs;
  }
}
```

### 2. Maintenance Schedule Visitor

A visitor that generates maintenance schedules based on product type and characteristics:

```typescript
export class MaintenanceScheduleVisitor implements ProductVisitor {
  visitRegulator(product: RegulatorProduct): MaintenanceSchedule {
    // Different schedules based on regulator characteristics
    const isForColdWater = product.specifications.temperature === 'Cold water';
    const diveFrequency = this.getDiveFrequency();
    
    return {
      annualService: true,
      serviceIntervalMonths: isForColdWater ? 6 : 12,
      preDiveChecks: [
        'Check mouthpiece for tears',
        'Test purge button',
        'Check for leaks when pressurized',
        'Ensure second stage breathes smoothly'
      ],
      postDiveActions: [
        'Rinse thoroughly with fresh water',
        'Purge with fresh water',
        'Allow to dry completely',
        isForColdWater ? 'Check for ice buildup and damage' : null
      ].filter(Boolean)
    };
  }
  
  visitBCD(product: BCDProduct): MaintenanceSchedule {
    // Different schedules based on BCD characteristics
    const hasPockets = product.specifications.weight_pocket === 'Yes';
    
    return {
      annualService: false,
      serviceIntervalMonths: 24,
      preDiveChecks: [
        'Check inflation and deflation',
        'Inspect dump valves',
        'Check oral inflation',
        hasPockets ? 'Secure weight pockets' : null
      ].filter(Boolean),
      postDiveActions: [
        'Rinse exterior with fresh water',
        'Fill bladder partially with fresh water and slosh',
        'Drain completely',
        'Inflate and store partially inflated'
      ]
    };
  }
  
  visitFin(product: FinProduct): MaintenanceSchedule {
    // Fins have minimal maintenance needs
    return {
      annualService: false,
      serviceIntervalMonths: 0, // No scheduled service
      preDiveChecks: [
        'Check straps for wear',
        'Inspect blades for cracks or damage'
      ],
      postDiveActions: [
        'Rinse with fresh water',
        'Allow to dry away from direct sunlight'
      ]
    };
  }
  
  private getDiveFrequency(): number {
    // In a real app, this would be user-specific
    return 20; // Default to 20 dives per year
  }
}

interface MaintenanceSchedule {
  annualService: boolean;
  serviceIntervalMonths: number;
  preDiveChecks: string[];
  postDiveActions: string[];
}
```

### 3. Product Compatibility Visitor

A visitor that checks compatibility between different product types:

```typescript
export class CompatibilityCheckerVisitor implements ProductVisitor {
  private otherProducts: VisitableProduct[];
  
  constructor(otherProducts: VisitableProduct[]) {
    this.otherProducts = otherProducts;
  }
  
  visitRegulator(product: RegulatorProduct): CompatibilityResult {
    const compatibilityIssues = [];
    const compatibleWith = [];
    
    // Check compatibility with other products
    for (const otherProduct of this.otherProducts) {
      if (otherProduct.type === 'regulator') {
        // Regulators don't interact with other regulators
        continue;
      }
      
      if (otherProduct.type === 'bcd') {
        const bcd = otherProduct as BCDProduct;
        
        // Check for compatibility issues
        if (product.specifications.low_pressure_port < 4 && 
            bcd.specifications.type === 'Backplate') {
          compatibilityIssues.push({
            product: bcd,
            issue: 'This regulator has insufficient LP ports for a technical backplate configuration'
          });
        } else {
          compatibleWith.push(bcd);
        }
      }
    }
    
    return {
      product,
      compatibleWith,
      compatibilityIssues
    };
  }
  
  visitBCD(product: BCDProduct): CompatibilityResult {
    const compatibilityIssues = [];
    const compatibleWith = [];
    
    // Check compatibility with other products
    for (const otherProduct of this.otherProducts) {
      if (otherProduct.type === 'bcd') {
        // BCDs don't interact with other BCDs
        continue;
      }
      
      if (otherProduct.type === 'regulator') {
        const reg = otherProduct as RegulatorProduct;
        
        // Check for compatibility issues
        if (product.specifications.type === 'Backplate' && 
            reg.specifications.low_pressure_port < 4) {
          compatibilityIssues.push({
            product: reg,
            issue: 'This technical BCD requires a regulator with at least 4 LP ports'
          });
        } else {
          compatibleWith.push(reg);
        }
      }
    }
    
    return {
      product,
      compatibleWith,
      compatibilityIssues
    };
  }
  
  visitFin(product: FinProduct): CompatibilityResult {
    // Fins typically have minimal compatibility issues with other gear
    return {
      product,
      compatibleWith: this.otherProducts.filter(p => p.id !== product.id),
      compatibilityIssues: []
    };
  }
}

interface CompatibilityResult {
  product: Product;
  compatibleWith: Product[];
  compatibilityIssues: {
    product: Product;
    issue: string;
  }[];
}
```

### 4. Export Formatter Visitor

A visitor that formats product information for different export formats:

```typescript
export class ExportFormatterVisitor<T> implements ProductVisitor {
  private format: 'json' | 'csv' | 'pdf';
  
  constructor(format: 'json' | 'csv' | 'pdf') {
    this.format = format;
  }
  
  visitRegulator(product: RegulatorProduct): T {
    switch (this.format) {
      case 'json':
        return this.formatAsJson(product) as T;
      case 'csv':
        return this.formatAsCsv(product) as T;
      case 'pdf':
        return this.formatAsPdfData(product) as T;
    }
  }
  
  visitBCD(product: BCDProduct): T {
    switch (this.format) {
      case 'json':
        return this.formatAsJson(product) as T;
      case 'csv':
        return this.formatAsCsv(product) as T;
      case 'pdf':
        return this.formatAsPdfData(product) as T;
    }
  }
  
  visitFin(product: FinProduct): T {
    switch (this.format) {
      case 'json':
        return this.formatAsJson(product) as T;
      case 'csv':
        return this.formatAsCsv(product) as T;
      case 'pdf':
        return this.formatAsPdfData(product) as T;
    }
  }
  
  private formatAsJson(product: Product): any {
    // Format specific to product type but returns in JSON format
    const baseData = {
      id: product.id,
      type: product.type,
      name: product.name,
      brand: product.brand,
      price: product.price
    };
    
    // Add specific fields based on product type
    if (product.type === 'regulator') {
      return {
        ...baseData,
        temperature: product.specifications.temperature,
        highPressurePorts: product.specifications.high_pressure_port,
        lowPressurePorts: product.specifications.low_pressure_port
      };
    } else if (product.type === 'bcd') {
      return {
        ...baseData,
        style: product.specifications.type,
        weightPockets: product.specifications.weight_pocket,
        liftCapacity: product.specifications.lift_capacity_base_on_largest_size_kg
      };
    } else if (product.type === 'fin') {
      return {
        ...baseData,
        material: product.specifications.material,
        style: product.specifications.style
      };
    }
    
    return baseData;
  }
  
  private formatAsCsv(product: Product): string {
    // Base CSV fields
    let csv = `${product.id},${product.type},${product.name},${product.brand},${product.price}`;
    
    // Add type-specific fields
    if (product.type === 'regulator') {
      csv += `,${product.specifications.temperature},${product.specifications.high_pressure_port},${product.specifications.low_pressure_port}`;
    } else if (product.type === 'bcd') {
      csv += `,${product.specifications.type},${product.specifications.weight_pocket},${product.specifications.lift_capacity_base_on_largest_size_kg}`;
    } else if (product.type === 'fin') {
      csv += `,${product.specifications.material},${product.specifications.style}`;
    }
    
    return csv;
  }
  
  private formatAsPdfData(product: Product): any {
    // Create structured data ready for PDF generation
    const title = `${product.brand} ${product.name}`;
    const subtitle = this.getPdfSubtitle(product);
    const sections = this.getPdfSections(product);
    
    return {
      title,
      subtitle,
      price: `$${product.price.toFixed(2)}`,
      imageUrl: product.imageUrl,
      sections
    };
  }
  
  private getPdfSubtitle(product: Product): string {
    switch (product.type) {
      case 'regulator':
        return `Diving Regulator - ${product.specifications.temperature}`;
      case 'bcd':
        return `Buoyancy Control Device - ${product.specifications.type} Style`;
      case 'fin':
        return `Diving Fins - ${product.specifications.style === 'open' ? 'Open Heel' : 'Full Foot'}`;
      default:
        return product.type.charAt(0).toUpperCase() + product.type.slice(1);
    }
  }
  
  private getPdfSections(product: Product): {heading: string, content: string[]}[] {
    const sections = [
      {
        heading: 'General Information',
        content: [
          `Brand: ${product.brand}`,
          `Model: ${product.name}`,
          `Price: $${product.price.toFixed(2)}`
        ]
      }
    ];
    
    // Add type-specific sections
    if (product.type === 'regulator') {
      sections.push({
        heading: 'Technical Specifications',
        content: [
          `Water Temperature: ${product.specifications.temperature}`,
          `HP Ports: ${product.specifications.high_pressure_port}`,
          `LP Ports: ${product.specifications.low_pressure_port}`,
          `Adjustable Airflow: ${product.specifications.adjustable_airflow || 'No'}`
        ]
      });
    } else if (product.type === 'bcd') {
      sections.push({
        heading: 'Technical Specifications',
        content: [
          `Style: ${product.specifications.type}`,
          `Weight Pockets: ${product.specifications.weight_pocket}`,
          `Weight: ${product.specifications.weight_kg} kg`,
          `Lift Capacity: ${product.specifications.lift_capacity_base_on_largest_size_kg} kg`
        ]
      });
    } else if (product.type === 'fin') {
      sections.push({
        heading: 'Technical Specifications',
        content: [
          `Material: ${product.specifications.material}`,
          `Style: ${product.specifications.style === 'open' ? 'Open Heel' : 'Full Foot'}`,
          `Stiffness: ${product.specifications.stiffness || 'Medium'}`
        ]
      });
    }
    
    return sections;
  }
}
```

### 5. Travel Weight Calculator Visitor

A visitor that calculates travel weight considerations for each product:

```typescript
export class TravelWeightCalculatorVisitor implements ProductVisitor {
  private travelMethod: 'airplane' | 'car' | 'boat';
  
  constructor(travelMethod: 'airplane' | 'car' | 'boat') {
    this.travelMethod = travelMethod;
  }
  
  visitRegulator(product: RegulatorProduct): TravelWeightInfo {
    // Base weight from specifications
    const baseWeight = product.specifications.weights_base_on_yoke || 1.2; // kg, default if not specified
    
    // Additional weights for accessories
    let accessoryWeight = 0;
    if (product.specifications.includes_gauge) accessoryWeight += 0.3;
    if (product.specifications.includes_octopus) accessoryWeight += 0.5;
    
    return this.calculateTravelInfo(product, baseWeight, accessoryWeight);
  }
  
  visitBCD(product: BCDProduct): TravelWeightInfo {
    // Base weight from specifications
    const baseWeight = product.specifications.weight_kg || 3.0; // kg, default if not specified
    
    // Additional weight for accessories
    let accessoryWeight = 0;
    if (product.specifications.weight_pocket === 'Yes') accessoryWeight += 0.5; // Empty weight pockets
    
    return this.calculateTravelInfo(product, baseWeight, accessoryWeight);
  }
  
  visitFin(product: FinProduct): TravelWeightInfo {
    // Base weight calculation for fins
    const baseWeight = product.specifications.weight_kg || 1.0; // kg, default if not specified
    const accessoryWeight = 0; // Fins typically don't have accessories
    
    return this.calculateTravelInfo(product, baseWeight, accessoryWeight);
  }
  
  private calculateTravelInfo(product: Product, baseWeight: number, accessoryWeight: number): TravelWeightInfo {
    const totalWeight = baseWeight + accessoryWeight;
    
    // Calculate limits and fees based on travel method
    let weightLimit: number;
    let extraFee: number = 0;
    let packingTips: string[] = [];
    
    switch (this.travelMethod) {
      case 'airplane':
        weightLimit = 23; // kg, typical checked baggage limit
        if (totalWeight > 5) {
          extraFee = 30; // Standard overweight fee
          packingTips.push('Pack in checked luggage');
          packingTips.push('Remove heavy components if possible');
        }
        break;
      case 'car':
        weightLimit = 100; // Essentially unlimited for car travel
        packingTips.push('No weight restrictions for car travel');
        break;
      case 'boat':
        weightLimit = 15; // kg, smaller boats may have strict limits
        if (totalWeight > 10) {
          extraFee = 20; // Some dive boats charge for extra weight
          packingTips.push('Check with boat operator for weight limits');
        }
        break;
    }
    
    // Add specific packing tips based on product type
    if (product.type === 'regulator') {
      packingTips.push('Pack in padded regulator bag');
      packingTips.push('Protect mouthpiece and hoses');
    } else if (product.type === 'bcd') {
      packingTips.push('Deflate completely and fold compactly');
      packingTips.push('Remove weights and accessories');
    } else if (product.type === 'fin') {
      packingTips.push('Stack fins together to save space');
      packingTips.push('Protect fin blades from bending');
    }
    
    return {
      product: product,
      baseWeight,
      accessoryWeight,
      totalWeight,
      weightLimit,
      extraFee,
      exceedsLimit: totalWeight > weightLimit,
      packingTips
    };
  }
}

interface TravelWeightInfo {
  product: Product;
  baseWeight: number;
  accessoryWeight: number;
  totalWeight: number;
  weightLimit: number;
  extraFee: number;
  exceedsLimit: boolean;
  packingTips: string[];
}
```

## Usage in Components

Here's how these alternative visitors could be used in the application:

### Technical Specs Formatter Example

```typescript
// src/components/product/ProductSpecifications.tsx
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { TechnicalSpecsFormatterVisitor } from '../../patterns/visitor/AlternativeVisitors';

const ProductSpecifications = ({ product }) => {
  const [formattedSpecs, setFormattedSpecs] = useState<string[]>([]);
  
  useEffect(() => {
    // Convert to visitable product
    const visitableProduct = makeVisitable(product);
    
    // Apply visitor to get formatted specifications
    const specsVisitor = new TechnicalSpecsFormatterVisitor();
    const specs = visitableProduct.accept(specsVisitor);
    
    setFormattedSpecs(specs);
  }, [product]);
  
  return (
    <View style={styles.specsContainer}>
      <Text style={styles.specsTitle}>Specifications</Text>
      {formattedSpecs.map((spec, index) => (
        <Text key={index} style={styles.specItem}>{spec}</Text>
      ))}
    </View>
  );
};
```

### Compatibility Checker Example

```typescript
// src/screens/ProductCompatibility/CompatibilityScreen.tsx
import { ServiceFacade } from '../../patterns/facade/ServiceFacade';
import { CompatibilityCheckerVisitor } from '../../patterns/visitor/AlternativeVisitors';

const CompatibilityScreen = ({ route }) => {
  const { productId } = route.params;
  const [mainProduct, setMainProduct] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);
  const [compatibilityResults, setCompatibilityResults] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      const serviceFacade = ServiceFacade.getInstance();
      
      // Load the main product
      const { product } = await serviceFacade.getProductWithTechDetails(productId);
      setMainProduct(product);
      
      // Load other products for comparison
      const allProducts = await serviceFacade.getProductsWithFilters({});
      const others = allProducts.filter(p => p.id !== productId);
      setOtherProducts(others);
      
      // Make all products visitable
      const visitableMain = makeVisitable(product);
      const visitableOthers = others.map(p => makeVisitable(p));
      
      // Run compatibility check
      const compatibilityVisitor = new CompatibilityCheckerVisitor(visitableOthers);
      const results = visitableMain.accept(compatibilityVisitor);
      
      setCompatibilityResults(results);
    };
    
    loadData();
  }, [productId]);
  
  // Render component with compatibility results...
};
```

## Benefits of These Alternative Visitors

These alternative visitor implementations showcase the flexibility of the Visitor pattern by:

1. **Encapsulating Different Algorithms**: Each visitor encapsulates a specific algorithm or operation that can be applied to different product types.

2. **Type-Specific Processing**: Visitors can perform type-specific processing without conditional logic in the components.

3. **Single Responsibility**: Each visitor has a single responsibility, making the code easier to understand and maintain.

4. **Open for Extension**: New visitors can be added without modifying the product classes.

5. **Clean Component Code**: UI components can use visitors without understanding the complexities of different product types.

## Conclusion

The Visitor pattern provides a powerful way to add operations to the product hierarchy without modifying the product classes. The alternative examples shown here demonstrate how the pattern can be extended beyond the current implementation to handle a variety of operations such as technical specification formatting, compatibility checking, maintenance scheduling, export formatting, and travel weight calculation.

Each visitor implementation follows the same basic pattern but addresses different concerns, showcasing the versatility of the Visitor pattern in providing clean separation of concerns and maintainable code. 