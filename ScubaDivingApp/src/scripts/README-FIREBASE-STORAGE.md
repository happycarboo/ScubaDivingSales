# Firebase Storage Integration Guide

This guide explains how to set up and use Firebase Storage for storing local images in your Scuba Diving Sales app.

## Overview

The solution provides:
1. A script to upload local images to Firebase Storage and update the database schema
2. A service class for interacting with Firebase Storage from your app
3. Database schema extensions to track and manage images

## Setup Steps

### 1. Install Required Packages

First, install the required packages:

```bash
# Install Firebase Storage
npm install firebase/storage

# If you want to use the mobile image picker (optional)
npm install expo-image-picker expo-file-system
```

### 2. Enable Firebase Storage in Firebase Console

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project
3. In the left sidebar, click on "Storage"
4. Click "Get Started" and follow the setup wizard
5. Set up your storage rules (default rules allow authenticated users to read/write)

### 3. Organize Your Local Images

Create a directory structure for your local images:

```
ScubaDivingApp/
  └── assets/
      └── images/
          └── products/
              ├── regulator/
              │   ├── 1-mk19evo.jpg
              │   ├── 2-mk2evo.jpg
              │   └── 3-xl4.jpg
              └── bcd/
                  ├── 4-level.jpg
                  ├── 5-litehawk.jpg
                  └── 6-travelight.jpg
```

**Important**: Name your image files with the product ID followed by a hyphen and description (e.g., `1-mk19evo.jpg`).

### 4. Run the Setup Script

Run the Firebase Storage setup script:

```bash
npx ts-node src/scripts/setupFirebaseStorage.ts
```

This script will:
- Scan your local images directory
- Upload images to Firebase Storage
- Update product documents with image references
- Create a new `images` collection to track all uploaded images

## Database Schema Changes

This integration adds the following to your database schema:

### 1. Products Collection Updates

New fields added to each product:
- `firebaseImage`: URL to the image in Firebase Storage
- `localImageName`: Original local file name
- `hasLocalImage`: Boolean flag (true if product has an uploaded image)
- `updatedAt`: Timestamp of the last update

### 2. New Images Collection

A new collection to track all uploaded images with documents containing:
- `productId`: Reference to the product
- `imageUrl`: URL to the image in Firebase Storage
- `originalFileName`: Name of the original file
- `category`: Product category (regulator, bcd, etc.)
- `uploadedAt`: Timestamp when the image was uploaded
- `storageType`: Storage type (always "firebase")

## Using the FirebaseStorageService

The `FirebaseStorageService` class provides methods to:
1. Upload images to Firebase Storage
2. Retrieve images for products
3. Delete images
4. Download images to local storage

### Example Usage

```typescript
import { FirebaseStorageService } from '../services/firebase/FirebaseStorageService';

// Get the instance
const storageService = FirebaseStorageService.getInstance();

// Upload an image from file path
async function uploadProductImage(productId: string, localPath: string) {
  const category = 'regulator'; // or 'bcd'
  const filename = `${productId}-${Date.now()}.jpg`;
  const storagePath = `products/${category}/${filename}`;
  
  const downloadURL = await storageService.uploadImage(
    localPath, 
    storagePath
  );
  
  console.log(`Image uploaded: ${downloadURL}`);
  return downloadURL;
}

// Get all images for a product
async function getProductImages(productId: string) {
  const images = await storageService.getProductImages(productId);
  console.log(`Found ${images.length} images for product ${productId}`);
  return images;
}
```

## Troubleshooting

### Image Upload Issues
- Verify that Firebase Storage is enabled in your Firebase console
- Check that the image paths are correct
- Ensure your Firebase Storage rules allow write access

### Access Issues
- Ensure your app is authenticated with Firebase before accessing Storage
- Check the Firebase Storage rules if you're getting permission errors

## Advanced: Image Processing

For production use, consider adding:
1. Image compression before upload
2. Multiple image resolutions (thumbnails, full-size)
3. Image caching for faster loading 