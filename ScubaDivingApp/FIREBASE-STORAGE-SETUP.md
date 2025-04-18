# Firebase Storage Setup Guide

We've implemented the Firebase Storage integration for your Scuba Diving Sales app, but there are a few steps you need to complete to make it fully functional.

## Next Steps

### 1. Enable Firebase Storage in Firebase Console

The error we encountered (`storage/unknown` with a 404 status) indicates that Firebase Storage hasn't been enabled yet for your project.

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click on "Storage"
4. Click "Get Started" and follow the setup wizard
5. Set up your storage rules (you can start with the default rules)

### 2. Test the Implementation

Once Firebase Storage is enabled, you can:

1. Run the setup script again to upload your local images:
   ```bash
   npx ts-node src/scripts/setupFirebaseStorage.ts
   ```

2. Test the ImageUploader component which has been added to the ProductDetailsScreen.

### 3. Image Upload Linting Error

There's a linting error in the ProductDetailsScreen.tsx file related to module import types. You have two options:

1. Convert the ImageUploader component to a CommonJS module by changing its export syntax
2. Update the ProductDetailsScreen.tsx to use dynamic imports

For the simplest fix, modify the ImageUploader.tsx file:

```typescript
// Change from:
export default ImageUploader;

// To:
module.exports = ImageUploader;
```

### 4. Troubleshooting

If you encounter any issues with Firebase Storage:

1. Check your Firebase Storage rules to ensure they allow read/write operations
2. Verify that your Firebase config is correctly set up
3. Make sure the Firebase Storage bucket exists in your project

### 5. Directory Structure

We've set up the following directory structure for local images:
```
ScubaDivingApp/
  └── assets/
      └── images/
          └── products/
              ├── regulator/
              │   └── 1-mk19evo.jpg
              │   └── 2-mk2evo.jpg
              └── bcd/
                  └── 4-level.jpg
```

For adding more images, follow the naming convention: `{productId}-{description}.jpg`

### 6. Mobile App Considerations

For React Native mobile usage with file pickers, you may want to install additional packages:
```bash
npm install react-native-document-picker
```

Then update the ImageUploader component to use DocumentPicker instead of the web input element for mobile platforms. 