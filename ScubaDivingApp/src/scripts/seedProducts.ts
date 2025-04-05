import { ServiceFacade } from '../patterns/facade/ServiceFacade';
import { ProductFactory } from '../patterns/factory/ProductFactory';

async function seedProducts() {
  try {
    const serviceFacade = ServiceFacade.getInstance();
    await serviceFacade.initialize();
    
    const factory = new ProductFactory();
    
    const testProducts = [
      factory.createProduct(
        'regulator',
        '1',
        'Atomic B2',
        'Atomic',
        799.99,
        {
          firstStage: 'Balanced diaphragm',
          secondStage: 'Pneumatically balanced',
          weight: '2.6 lbs'
        },
        'https://example.com/atomic-b2.jpg'
      ),
      factory.createProduct(
        'bcd',
        '2',
        'ScubaPro Hydros Pro',
        'ScubaPro',
        899.99,
        {
          type: 'Back-inflation',
          liftCapacity: '36 lbs',
          weight: '4.2 lbs'
        },
        'https://example.com/hydros-pro.jpg'
      ),
      factory.createProduct(
        'fin',
        '3',
        'Mares Avanti Quattro Plus',
        'Mares',
        199.99,
        {
          material: 'Tecralene',
          style: 'Full foot',
          size: 'Medium'
        },
        'https://example.com/avanti-quattro.jpg'
      )
    ];

    for (const product of testProducts) {
      await serviceFacade.createProduct(product);
      console.log(`Created product: ${product.name}`);
    }

    console.log('Successfully seeded test products!');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

seedProducts(); 