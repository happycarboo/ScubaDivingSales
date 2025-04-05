// Firebase Service Implementation
// Single Responsibility Principle: Class only handles Firebase initialization and core functionality
// Uses Singleton pattern to ensure only one Firebase instance

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config/firebase.config';
import { IFirebaseService } from './interfaces/IFirebaseService';

export class FirebaseService implements IFirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;

  // Private constructor ensures singleton pattern
  private constructor() {}

  /**
   * Gets the singleton instance of FirebaseService
   */
  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Initializes Firebase and Firestore
   */
  public async initialize(): Promise<void> {
    if (!this.app) {
      try {
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
        console.log('Firebase initialized successfully');
      } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
      }
    }
  }

  /**
   * Checks if Firebase has been initialized
   */
  public isInitialized(): boolean {
    return this.app !== null && this.db !== null;
  }

  /**
   * Gets the Firestore database instance
   */
  public getFirestore(): Firestore {
    if (!this.db) {
      throw new Error('Firebase has not been initialized. Call initialize() first.');
    }
    return this.db;
  }
} 