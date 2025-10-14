// Simple test to verify the provider can be started
import('./dist/index.js').then(() => {
  console.log('Provider index loaded successfully');
  
  // Simulate a short delay to allow any initialization
  setTimeout(() => {
    console.log('Provider test completed');
    process.exit(0);
  }, 1000);
}).catch((error) => {
  console.error('Failed to load provider:', error);
  process.exit(1);
});