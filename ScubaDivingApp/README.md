# ScubaDivingSales Assistant App

A specialized sales assistant app for ScubaWarehouse, designed to help sales representatives provide better service by streamlining product selection, comparison, and recommendation.

## Architecture

This application is built using React Native for iPad and follows SOLID principles with the implementation of the following design patterns:

- **Factory Method Pattern**: For creating product objects based on their type
- **Visitor Pattern**: For implementing operations on products without modifying their classes
- **Facade Pattern**: For simplifying complex subsystem interactions

## Project Structure

```
ScubaDivingApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common UI elements
│   │   ├── product/         # Product-specific components
│   │   ├── comparison/      # Comparison view components
│   │   ├── search/          # Search-related components
│   │   └── recommendation/  # Recommendation components
│   ├── screens/             # Screen components
│   │   ├── ProductSelection/
│   │   ├── ProductDetails/
│   │   ├── Comparison/
│   │   ├── IntelligentSearch/
│   │   └── RealTimeComparison/
│   ├── services/            # Services for API calls and data handling
│   │   ├── api/
│   │   ├── firebase/
│   │   └── scraper/
│   ├── patterns/            # Design pattern implementations
│   │   ├── factory/         # Factory Method pattern
│   │   ├── visitor/         # Visitor pattern
│   │   └── facade/          # Facade pattern
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── types/               # TypeScript type definitions
│   └── __tests__/           # Test files
├── App.tsx                  # Main app component
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Xcode (latest version) for iOS development
- iOS Simulator with iPad support
- macOS for iOS development

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/ScubaDivingSales.git
cd ScubaDivingSales
```

2. Navigate to the app directory
```bash
cd ScubaDivingApp
```

3. Install dependencies
```bash
npm install
```

### Running the App

1. **Start the development server**
```bash
npx expo start
```

2. **Launch on iPad Simulator**
   - Once the Expo server is running, you'll see a QR code in the terminal
   - Press `shift + i` to open the iPad simulator
   - The app will automatically load in the simulator
   - If the simulator doesn't appear:
     - Open Xcode → Xcode menu → Open Developer Tool → Simulator
     - Or run `open -a Simulator` in a new terminal window
     - Return to the Expo terminal and press `i` again

3. **Troubleshooting Simulator Issues**
   If the simulator doesn't launch:
   ```bash
   # Reset all simulators
   xcrun simctl shutdown all
   xcrun simctl erase all
   ```
   Then restart the Expo server and try again.

4. **Development Mode**
   - Use `cmd + D` in the simulator to open the developer menu
   - Enable Hot Reloading for instant updates while coding
   - Use the React Native Debugger for debugging

5. **Terminating the App**
   - To stop the development server: Press `Ctrl + C` in the terminal
   - To close everything (server and simulator):
   ```bash
   # Kill Expo process and shutdown simulators
   pkill -f "expo" && xcrun simctl shutdown all
   ```

### Testing

```bash
npm test
# or
yarn test
```

## SOLID Principles Implementation

- **Single Responsibility Principle**: Each class has a single responsibility (e.g., ProductFactory only creates products)
- **Open/Closed Principle**: The system is open for extension (new product types can be added) but closed for modification
- **Liskov Substitution Principle**: Derived classes (like RegulatorProduct) can be substituted for their base classes (Product)
- **Interface Segregation Principle**: Clients only depend on interfaces they use (e.g., ProductVisitor)
- **Dependency Inversion Principle**: High-level modules depend on abstractions, not implementations

## Design Patterns Implementation

### Factory Method Pattern
Located in `src/patterns/factory/ProductFactory.ts`, this pattern allows creating different product types through a common interface.

### Visitor Pattern
Located in `src/patterns/visitor/ProductVisitor.ts`, this pattern enables adding new operations to product objects without modifying their structure.

### Facade Pattern
Located in `src/patterns/facade/ServiceFacade.ts`, this pattern provides a simplified interface to the complex subsystem of services. 