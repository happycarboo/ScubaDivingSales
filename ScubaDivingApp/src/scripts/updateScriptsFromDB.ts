import * as fs from 'fs';
import * as path from 'path';

// Path to the generated data file (will be created by syncFirestoreSchema.ts)
const generatedDataPath = path.join(__dirname, 'updatedFirestoreData.ts');

// Paths to the scripts we want to update
const scriptPaths = [
  path.join(__dirname, 'updateFirestore.ts'),
  path.join(__dirname, 'seedProducts.ts')
];

async function updateScripts() {
  try {
    console.log('Starting script update process...');
    
    // Check if the generated data file exists
    if (!fs.existsSync(generatedDataPath)) {
      console.error('Error: updatedFirestoreData.ts not found. Please run syncFirestoreSchema.ts first.');
      return;
    }
    
    // Import the generated data
    const { productsData, regulatorsData, bcdsData } = require('./updatedFirestoreData');
    
    // Create backup of original scripts
    for (const scriptPath of scriptPaths) {
      const backupPath = `${scriptPath}.backup-${Date.now()}`;
      fs.copyFileSync(scriptPath, backupPath);
      console.log(`Created backup of ${path.basename(scriptPath)} at ${path.basename(backupPath)}`);
    }
    
    // Update each script
    for (const scriptPath of scriptPaths) {
      console.log(`Updating ${path.basename(scriptPath)}...`);
      let content = fs.readFileSync(scriptPath, 'utf8');
      
      // Replace the data arrays while preserving variable names and structure
      content = replaceDataInScript(content, 'productsData', JSON.stringify(productsData, null, 2));
      content = replaceDataInScript(content, 'regulatorsData', JSON.stringify(regulatorsData, null, 2));
      content = replaceDataInScript(content, 'bcdsData', JSON.stringify(bcdsData, null, 2));
      
      // Save updated script
      fs.writeFileSync(scriptPath, content);
      console.log(`Successfully updated ${path.basename(scriptPath)}`);
    }
    
    console.log('All scripts have been updated with current database schema!');
    console.log('The original scripts have been backed up with timestamp suffixes.');
    
  } catch (error) {
    console.error('Error updating scripts:', error);
  }
}

// Helper function to replace data arrays in scripts while preserving variable declarations
function replaceDataInScript(content: string, variableName: string, newData: string) {
  // This regex matches the variable declaration and the array content
  const regex = new RegExp(`(const\\s+${variableName}\\s*=\\s*)\\[\\s*\\{[\\s\\S]*?\\}\\s*\\];`, 'g');
  
  return content.replace(regex, `$1${newData};`);
}

// Run the update
updateScripts(); 