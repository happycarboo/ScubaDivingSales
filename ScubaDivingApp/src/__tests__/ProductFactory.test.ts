import { ProductFactory, RegulatorProduct, BCDProduct, FinProduct } from '../patterns/factory/ProductFactory';

describe('ProductFactory', () => {
  let factory: ProductFactory;

  beforeEach(() => {
    factory = new ProductFactory();
  });

  test('creates a regulator product', () => {
    const product = factory.createProduct(
      'regulator',
      '1',
      'Test Regulator',
      'TestBrand',
      500,
      { qualityScore: 8 }
    );

    expect(product).toBeInstanceOf(RegulatorProduct);
    expect(product.id).toBe('1');
    expect(product.name).toBe('Test Regulator');
    expect(product.brand).toBe('TestBrand');
    expect(product.price).toBe(500);
    expect(product.specifications.qualityScore).toBe(8);
    expect(product.getDescription()).toContain('Test Regulator');
  });

  test('creates a BCD product', () => {
    const product = factory.createProduct(
      'bcd',
      '2',
      'Test BCD',
      'TestBrand',
      600,
      { qualityScore: 7 }
    );

    expect(product).toBeInstanceOf(BCDProduct);
    expect(product.id).toBe('2');
    expect(product.name).toBe('Test BCD');
    expect(product.brand).toBe('TestBrand');
    expect(product.price).toBe(600);
    expect(product.specifications.qualityScore).toBe(7);
    expect(product.getDescription()).toContain('Test BCD');
  });

  test('creates a fin product', () => {
    const product = factory.createProduct(
      'fin',
      '3',
      'Test Fin',
      'TestBrand',
      200,
      { qualityScore: 9 }
    );

    expect(product).toBeInstanceOf(FinProduct);
    expect(product.id).toBe('3');
    expect(product.name).toBe('Test Fin');
    expect(product.brand).toBe('TestBrand');
    expect(product.price).toBe(200);
    expect(product.specifications.qualityScore).toBe(9);
    expect(product.getDescription()).toContain('Test Fin');
  });

  test('throws an error for unsupported product type', () => {
    expect(() => {
      // @ts-ignore - Testing invalid type scenario
      factory.createProduct('unsupported', '4', 'Test', 'Brand', 100, {});
    }).toThrow('Product type unsupported is not supported');
  });
}); 