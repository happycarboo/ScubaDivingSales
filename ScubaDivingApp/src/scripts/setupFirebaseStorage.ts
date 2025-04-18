import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseConfig } from '../services/firebase/config/firebase.config';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Image directory - update this path to your local images folder
const LOCAL_IMAGES_DIR = path.join(__dirname, '../../assets/images/products');

// Product categories
const PRODUCT_CATEGORIES = ['regulator', 'bcd'];

interface ProductImage {
  productId: string;
  localPath: string;
  category: string;
  fileName: string;
}

/**
 * Uploads a local image to Firebase Storage
 * @param localPath Path to local image file
 * @param storagePath Path in Firebase Storage
 * @returns Download URL of the uploaded image
 */
async function uploadImageToStorage(localPath: string, storagePath: string): Promise<string> {
  try {
    console.log(`Uploading ${localPath} to ${storagePath}...`);
    
    // Read the file
    const fileBuffer = fs.readFileSync(localPath);
    
    // Create a storage reference
    const storageRef = ref(storage, storagePath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, fileBuffer);
    console.log('Image uploaded successfully!');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`Download URL: ${downloadURL}`);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Scans the local images directory and associates images with products
 * @returns Array of product images
 */
function scanLocalImages(): ProductImage[] {
  const productImages: ProductImage[] = [];
  
  try {
    // Check if directory exists
    if (!fs.existsSync(LOCAL_IMAGES_DIR)) {
      console.log(`Creating local images directory: ${LOCAL_IMAGES_DIR}`);
      fs.mkdirSync(LOCAL_IMAGES_DIR, { recursive: true });
      
      // Create subdirectories for product categories
      for (const category of PRODUCT_CATEGORIES) {
        const categoryDir = path.join(LOCAL_IMAGES_DIR, category);
        if (!fs.existsSync(categoryDir)) {
          fs.mkdirSync(categoryDir, { recursive: true });
        }
      }
      
      console.log('Image directories created. Please add your images and run this script again.');
      return productImages;
    }
    
    // Scan each category directory
    for (const category of PRODUCT_CATEGORIES) {
      const categoryDir = path.join(LOCAL_IMAGES_DIR, category);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
        continue;
      }
      
      // Read all files in the category directory
      const files = fs.readdirSync(categoryDir);
      
      for (const file of files) {
        // Skip non-image files
        if (!['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase())) {
          continue;
        }
        
        // Extract product ID from filename (assuming format: productId-description.ext)
        const fileName = path.basename(file);
        const productId = fileName.split('-')[0];
        
        if (!productId) {
          console.log(`Skipping ${file} - cannot determine product ID from filename`);
          continue;
        }
        
        productImages.push({
          productId,
          localPath: path.join(categoryDir, file),
          category,
          fileName
        });
      }
    }
    
    return productImages;
  } catch (error) {
    console.error('Error scanning local images:', error);
    return [];
  }
}

/**
 * Updates product documents with image references
 * @param productId Product ID
 * @param imageUrl Firebase Storage download URL
 * @param localImageName Original local image name
 */
async function updateProductWithImage(productId: string, imageUrl: string, localImageName: string): Promise<void> {
  try {
    // Get the product document
    const productRef = doc(db, 'products', productId);
    
    // Update the product with the new image fields
    await updateDoc(productRef, {
      firebaseImage: imageUrl,
      localImageName: localImageName,
      hasLocalImage: true,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Updated product ${productId} with image: ${imageUrl}`);
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
  }
}

/**
 * Creates a new images collection to track all uploaded images
 * @param productId Product ID 
 * @param imageUrl Firebase Storage download URL
 * @param localPath Original local path
 * @param category Product category
 */
async function createImageDocument(productId: string, imageUrl: string, localPath: string, category: string): Promise<void> {
  try {
    const imageId = `${productId}-${Date.now()}`;
    const imagesRef = doc(db, 'images', imageId);
    
    await setDoc(imagesRef, {
      productId,
      imageUrl,
      originalFileName: path.basename(localPath),
      category,
      uploadedAt: new Date().toISOString(),
      storageType: 'firebase'
    });
    
    console.log(`Created image document with ID: ${imageId}`);
  } catch (error) {
    console.error('Error creating image document:', error);
  }
}

/**
 * Main function to orchestrate the Firebase Storage setup and schema update
 */
async function setupFirebaseStorage() {
  try {
    console.log('Starting Firebase Storage setup and schema update...');
    
    // Scan local images directory
    const productImages = scanLocalImages();
    
    if (productImages.length === 0) {
      console.log('No images found. Please add images to the assets/images/products directory.');
      return;
    }
    
    console.log(`Found ${productImages.length} images to process.`);
    
    // Process each image
    for (const image of productImages) {
      // Generate storage path
      const storagePath = `products/${image.category}/${image.fileName}`;
      
      // Upload image to Firebase Storage
      const downloadURL = await uploadImageToStorage(image.localPath, storagePath);
      
      // Update product document with image reference
      await updateProductWithImage(image.productId, downloadURL, image.fileName);
      
      // Create image document
      await createImageDocument(image.productId, downloadURL, image.localPath, image.category);
    }
    
    console.log('Firebase Storage setup and schema update completed successfully!');
    console.log('The following changes have been made:');
    console.log('1. Images uploaded to Firebase Storage');
    console.log('2. Product documents updated with image references');
    console.log('3. New images collection created to track all images');
    
  } catch (error) {
    console.error('Error setting up Firebase Storage:', error);
  }
}

// Run the setup
setupFirebaseStorage(); 