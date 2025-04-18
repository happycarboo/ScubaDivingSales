import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from '../services/firebase/config/firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// The product data from screenshots
const productsData = [
  {
    id: '1',
    brand: 'ScubaPro',
    model: 'MK19 EVO + G260 Carbon BT',
    price: 1299,
    link: 'https://scubawarehouse.com.sg/product/scubapro-mk19evo-bt-g260bt-regulator/',
    category: 'regulator',
    type: 'regulator'
  },
  {
    id: '2',
    brand: 'ScubaPro',
    model: 'MK2 EVO + R095',
    price: 405,
    link: 'https://scubawarehouse.com.sg/product/scubapro-mk2-evo-r095-regulator-2/',
    category: 'regulator',
    type: 'regulator'
  },
  {
    id: '3',
    brand: 'Apeks',
    model: 'XL4 + Regulator',
    price: 799,
    link: 'https://scubawarehouse.com.sg/product/apeks-xl4-regulator-set-3/',
    category: 'regulator',
    type: 'regulator'
  },
  {
    id: '4',
    brand: 'Scubapro',
    model: 'Level',
    price: 650,
    link: 'https://scubawarehouse.com.sg/product/scubapro-level-bcd/',
    category: 'BCD',
    type: 'bcd'
  },
  {
    id: '5',
    brand: 'Scubapro',
    model: 'Litehawk',
    price: 635,
    link: 'https://scubawarehouse.com.sg/product/scubapro-litehawk-bcd/',
    category: 'BCD',
    type: 'bcd'
  },
  {
    id: '6',
    brand: 'Cressi',
    model: 'Travelight',
    price: 640,
    link: 'https://scubawarehouse.com.sg/product/cressi-travelight-bcd/',
    category: 'BCD',
    type: 'bcd'
  }
];

// Regulator details from screenshot
const regulatorsData = [
  {
    prod_id: '1',
    category: 'regulator',
    temperature: 'Cold water',
    high_pressure_port: 2,
    low_pressure_port: 5,
    adjustable_airflow: 'YES',
    pre_dive_mode: 'YES',
    weights_base_on_yoke: 1310,
    material: 'Carbon fibre front',
    dive_type: 'Recreational / Tech / Contaminated',
    airflow_at_200bar: '1800 l/min'
  },
  {
    prod_id: '2',
    category: 'regulator',
    temperature: 'Cold water',
    high_pressure_port: 1,
    low_pressure_port: 4,
    adjustable_airflow: 'NO',
    pre_dive_mode: 'NO',
    weights_base_on_yoke: 871,
    material: 'Chrome Plated',
    dive_type: 'Recreational',
    airflow_at_200bar: '1400 l/min'
  },
  {
    prod_id: '3',
    category: 'regulator',
    temperature: 'Cold water',
    high_pressure_port: 2,
    low_pressure_port: 3,
    adjustable_airflow: 'NO',
    pre_dive_mode: 'YES',
    weights_base_on_yoke: 1041,
    material: 'Satin',
    dive_type: 'Recreational',
    airflow_at_200bar: '1500 l/min'
  }
];

// BCD details from screenshot
const bcdsData = [
  {
    prod_id: '4',
    category: 'BCD',
    type: 'Jacket',
    weight_pocket: 'Yes',
    quick_release: 'Yes',
    no_pockets: 2,
    back_trim_pocket: 'Yes',
    weight_kg: 2.7,
    has_size: 'Yes',
    lift_capacity_base_on_largest_size_kg: 17.3
  },
  {
    prod_id: '5',
    category: 'BCD',
    type: 'Backplate',
    weight_pocket: 'Yes',
    quick_release: 'No',
    no_pockets: 2,
    back_trim_pocket: 'Yes',
    weight_kg: 2.3,
    has_size: 'Yes',
    lift_capacity_base_on_largest_size_kg: 13.2
  },
  {
    prod_id: '6',
    category: 'BCD',
    type: 'Jacket',
    weight_pocket: 'Yes',
    quick_release: 'Yes',
    no_pockets: 2,
    back_trim_pocket: 'Yes',
    weight_kg: 2.8,
    has_size: 'Yes',
    lift_capacity_base_on_largest_size_kg: 16.3
  }
];

async function updateFirestore() {
  try {
    console.log('Starting Firebase update...');
    
    // Add products collection
    console.log('Adding products...');
    for (const product of productsData) {
      await setDoc(doc(db, 'products', product.id), product);
      console.log(`Added product: ${product.brand} ${product.model}`);
    }
    
    // Add regulators collection
    console.log('Adding regulator details...');
    for (const regulator of regulatorsData) {
      await setDoc(doc(db, 'regulators', regulator.prod_id), regulator);
      console.log(`Added regulator details for product ID: ${regulator.prod_id}`);
    }
    
    // Add bcds collection
    console.log('Adding BCD details...');
    for (const bcd of bcdsData) {
      await setDoc(doc(db, 'bcds', bcd.prod_id), bcd);
      console.log(`Added BCD details for product ID: ${bcd.prod_id}`);
    }
    
    console.log('Firestore update completed successfully!');
  } catch (error) {
    console.error('Error updating Firestore:', error);
  }
}

// Run the update
updateFirestore(); 