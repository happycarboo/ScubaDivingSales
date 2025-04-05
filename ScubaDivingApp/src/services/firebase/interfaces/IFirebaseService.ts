// Interface for Firebase Service
// Interface Segregation Principle: Small, focused interface with only needed methods

import { Firestore } from 'firebase/firestore';

export interface IFirebaseService {
  /**
   * Initializes Firebase and Firestore
   */
  initialize(): Promise<void>;
  
  /**
   * Checks if Firebase has been initialized
   */
  isInitialized(): boolean;
  
  /**
   * Gets the Firestore database instance
   */
  getFirestore(): Firestore;
} 