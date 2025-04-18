import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

/**
 * FirebaseStorageService provides methods to interact with Firebase Storage
 */
export class FirebaseStorageService {
  private static instance: FirebaseStorageService;
  private storage = getStorage();
  private db = getFirestore();

  private constructor() {}

  /**
   * Get the singleton instance of FirebaseStorageService
   */
  public static getInstance(): FirebaseStorageService {
    if (!FirebaseStorageService.instance) {
      FirebaseStorageService.instance = new FirebaseStorageService();
    }
    return FirebaseStorageService.instance;
  }

  /**
   * Upload a file to Firebase Storage
   * @param file File to upload
   * @param path Path in Firebase Storage
   * @param metadata Optional metadata for the file
   * @returns Download URL of the uploaded file
   */
  public async uploadFile(
    file: File,
    path: string,
    metadata?: any
  ): Promise<string> {
    try {
      // Create a storage reference
      const storageRef = ref(this.storage, path);

      // Upload the file
      const snapshot = await uploadBytes(storageRef, file, metadata);
      console.log('File uploaded successfully!');

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload a blob to Firebase Storage
   * @param blob Blob to upload
   * @param path Path in Firebase Storage
   * @param metadata Optional metadata for the blob
   * @returns Download URL of the uploaded blob
   */
  public async uploadBlob(
    blob: Blob,
    path: string,
    metadata?: any
  ): Promise<string> {
    try {
      // Create a storage reference
      const storageRef = ref(this.storage, path);

      // Upload the blob
      const snapshot = await uploadBytes(storageRef, blob, metadata);
      console.log('Blob uploaded successfully!');

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading blob:', error);
      throw error;
    }
  }

  /**
   * Upload and associate an image with a product
   * @param productId ID of the product
   * @param file File or Blob to upload
   * @param category Product category
   * @param filename Custom filename (optional)
   * @returns Object with download URL and image document ID
   */
  public async uploadProductImage(
    productId: string,
    file: File | Blob,
    category: string,
    filename?: string
  ): Promise<{ url: string; imageId: string }> {
    try {
      // Generate a unique filename if not provided
      const actualFilename = filename || `${productId}-${Date.now()}.jpg`;
      const storagePath = `products/${category}/${actualFilename}`;
      
      // Upload the file
      const downloadURL = await this.uploadBlob(file instanceof File ? file : file, storagePath);
      
      // Create an image document in Firestore
      const imageData = {
        productId,
        imageUrl: downloadURL,
        category,
        filename: actualFilename,
        uploadedAt: new Date().toISOString(),
        storageType: 'firebase'
      };
      
      const imageDoc = await addDoc(collection(this.db, 'images'), imageData);
      
      // Update the product with the new image
      const productRef = doc(this.db, 'products', productId);
      await updateDoc(productRef, {
        firebaseImage: downloadURL,
        hasLocalImage: true,
        updatedAt: new Date().toISOString()
      });
      
      return {
        url: downloadURL,
        imageId: imageDoc.id
      };
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  }

  /**
   * Get all images for a product
   * @param productId ID of the product
   * @returns Array of image documents
   */
  public async getProductImages(productId: string): Promise<any[]> {
    try {
      const imagesQuery = query(
        collection(this.db, 'images'),
        where('productId', '==', productId)
      );
      
      const querySnapshot = await getDocs(imagesQuery);
      const images: any[] = [];
      
      querySnapshot.forEach((doc) => {
        images.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return images;
    } catch (error) {
      console.error('Error getting product images:', error);
      throw error;
    }
  }

  /**
   * Delete an image from Firebase Storage and mark its document as deleted in Firestore
   * @param imageUrl URL or storage path of the image to delete
   * @param imageId ID of the image document
   */
  public async deleteImage(imageUrl: string, imageId: string): Promise<void> {
    try {
      // Create a reference to the file to delete
      const storageRef = ref(this.storage, imageUrl);
      
      // Delete the file
      await deleteObject(storageRef);
      console.log('Image deleted from Storage successfully');
      
      // Mark the image document as deleted
      await updateDoc(doc(this.db, 'images', imageId), {
        deleted: true,
        deletedAt: new Date().toISOString()
      });
      
      console.log('Image document marked as deleted');
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  /**
   * Get image URL from Firebase Storage
   * @param path Path to the file in Firebase Storage
   * @returns Download URL of the file
   */
  public async getImageUrl(path: string): Promise<string> {
    try {
      const fileRef = ref(this.storage, path);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }
} 