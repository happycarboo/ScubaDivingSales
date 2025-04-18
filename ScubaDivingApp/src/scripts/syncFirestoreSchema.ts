import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../services/firebase/config/firebase.config';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections to sync
const collectionsToSync = ['products', 'regulators', 'bcds'];

async function syncFirestoreSchema() {
  try {
    console.log('Starting Firestore schema sync...');
    
    // Object to store all fetched data
    const allData: {
      products: any[];
      regulators: any[];
      bcds: any[];
    } = {
      products: [],
      regulators: [],
      bcds: []
    };
    
    // Fetch data from all collections
    for (const collectionName of collectionsToSync) {
      console.log(`Fetching ${collectionName} collection...`);
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allData[collectionName as keyof typeof allData].push({
          ...data,
          id: doc.id
        });
        console.log(`Retrieved document: ${doc.id} from ${collectionName}`);
      });
    }
    
    // Generate updated script content
    const scriptContent = generateScriptContent(allData);
    
    // Save to a new file
    const outputPath = path.join(__dirname, 'updatedFirestoreData.ts');
    fs.writeFileSync(outputPath, scriptContent);
    
    console.log(`Successfully synced schema! Updated data saved to: ${outputPath}`);
    console.log('You can now copy the data arrays from this file to update your existing scripts.');
    
  } catch (error) {
    console.error('Error syncing Firestore schema:', error);
  }
}

function generateScriptContent(data: any) {
  return `// Auto-generated from current Firestore database on ${new Date().toLocaleString()}
// Copy these arrays to your updateFirestore.ts or seedProducts.ts files

// Products collection data
export const productsData = ${JSON.stringify(data.products, null, 2)};

// Regulators collection data
export const regulatorsData = ${JSON.stringify(data.regulators, null, 2)};

// BCDs collection data
export const bcdsData = ${JSON.stringify(data.bcds, null, 2)};
`;
}

// Run the sync
syncFirestoreSchema(); 