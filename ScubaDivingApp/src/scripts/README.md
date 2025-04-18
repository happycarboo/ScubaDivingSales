# Firestore Synchronization Scripts

This directory contains scripts for managing the Firestore database for the Scuba Diving Sales application.

## Scripts Overview

1. **updateFirestore.ts**: Updates the Firestore database with predefined product data.
2. **seedProducts.ts**: Seeds the Firestore database using design patterns (Facade and Factory).
3. **syncFirestoreSchema.ts**: Reads current Firestore data and generates an updated schema file.
4. **updateScriptsFromDB.ts**: Updates the existing scripts with current database structure.

## How to Sync Database Schema

If your CTO or team members have made manual changes to the Firebase database through the web interface, you can use these scripts to sync the current database schema to your local scripts without affecting functionality.

### Step 1: Sync current Firestore schema

Run the sync script to fetch the current database structure:

```bash
npx ts-node src/scripts/syncFirestoreSchema.ts
```

This will:
- Connect to your Firestore database
- Read all documents from the 'products', 'regulators', and 'bcds' collections
- Generate a file called `updatedFirestoreData.ts` with the current data

### Step 2: Update your scripts with the new schema

Run the update script to safely update your existing scripts:

```bash
npx ts-node src/scripts/updateScriptsFromDB.ts
```

This will:
- Create backups of your original scripts with timestamp suffixes
- Update the data arrays in `updateFirestore.ts` and `seedProducts.ts` with current data
- Preserve the functionality and structure of the original scripts

## Safety Features

- Original scripts are backed up before any changes
- The update process maintains variable names and code structure
- Only the data arrays are updated, not the functional code

## Troubleshooting

- If you encounter errors related to Firebase authentication, make sure your `firebase.config.ts` contains valid credentials
- If the regex replacement fails, you may need to manually copy the arrays from `updatedFirestoreData.ts`
- Check the console output for detailed error messages during the process 