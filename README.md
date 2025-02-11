# Scuba Diving Sales App

This project is a Training Sales app for web and mobile (iOS) platforms using React Native, Node.js, and Firebase.

## Prerequisites

- Node.js and npm installed
- Firebase account
- Expo CLI

## Setup Instructions

### Backend Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/happycarboo/ScubaDivingSales.git
   cd ScubaDivingSales/training-sales-backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase Admin SDK**

   - Ensure the `scuba-2b4d1-firebase-adminsdk-fbsvc-28b3c7a874.json` file is in the `training-sales-backend` directory.

4. **Start the Backend Server**

   ```bash
   npm start
   ```

   The server will run on `http://localhost:5001`.

### Frontend Setup

1. **Navigate to Frontend Directory**

   ```bash
   cd ../training-sales-frontend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start the Frontend**

   ```bash
   npx expo start
   ```

   Use Expo Go to scan the QR code and run the app on your device.

### Verify the Setup

- **Backend**: Open a browser and go to `http://localhost:5001` to ensure the backend is running.
- **Frontend**: The app should display "Training Sales App" on your device.

## Notes

- Ensure that the backend is running before testing the frontend to allow API calls.
- Check console logs for any errors or warnings during development.

## Troubleshooting

- **Port Issues**: Ensure ports 5001 and 8081 are not in use by other applications.
- **Network Requests**: Use developer tools to inspect network requests and ensure they are reaching the backend.

Feel free to reach out if you encounter any issues!