import { epomlparse } from 'epoml';

/**
 * Examples showing different ways to pass JavaScript objects in JSX
 */

async function demonstrateJSXObjectPassing() {
  console.log('🚀 Different Ways to Pass JavaScript Objects in JSX\n');

  // ✅ Method 1: Template Variables (Recommended)
  console.log('1️⃣ Template Variables (Recommended):');
  const template1 = '<DataObject data={userProfile} name="User Profile" />';
  const result1 = await epomlparse(template1, { 
    userProfile: { 
      name: "Alice Johnson", 
      age: 28, 
      skills: ["JavaScript", "TypeScript", "React"],
      address: {
        city: "San Francisco",
        country: "USA"
      }
    } 
  });
  console.log(result1);
  console.log('\n' + '='.repeat(50) + '\n');

  // ✅ Method 2: JSON String
  console.log('2️⃣ JSON String:');
  const template2 = `<DataObject 
    data='{"product": "Laptop", "price": 999.99, "specs": {"ram": "16GB", "storage": "512GB SSD"}}' 
    name="Product Info" 
  />`;
  const result2 = await epomlparse(template2);
  console.log(result2);
  console.log('\n' + '='.repeat(50) + '\n');

  // ✅ Method 3: Nested Components with Template Variables
  console.log('3️⃣ Complex Nested Structure:');
  const template3 = `<ExampleSet title="API Examples">
    <Example title="User Registration">
      <ExampleInput label="Request Body" format="json">{requestBody}</ExampleInput>
      <ExampleOutput label="Response" format="json">{responseBody}</ExampleOutput>
    </Example>
  </ExampleSet>`;
  
  const result3 = await epomlparse(template3, {
    requestBody: JSON.stringify({
      username: "john_doe",
      email: "john@example.com",
      password: "secure_password"
    }, null, 2),
    responseBody: JSON.stringify({
      success: true,
      user_id: 12345,
      message: "User created successfully"
    }, null, 2)
  });
  console.log(result3);
  console.log('\n' + '='.repeat(50) + '\n');

  // ✅ Method 4: Mixed Approaches
  console.log('4️⃣ Mixed Approaches:');
  const template4 = `<div>
    <DataObject data={configObject} name="Configuration" />
    <DataObject data='{"status": "active", "version": "1.0.0"}' name="Status" inline={true} />
  </div>`;
  
  const result4 = await epomlparse(template4, {
    configObject: {
      database: {
        host: "localhost",
        port: 5432,
        name: "myapp_db"
      },
      cache: {
        enabled: true,
        ttl: 3600
      }
    }
  });
  console.log(result4);
}

// ❌ What DOESN'T work (for reference)
async function showWhatDoesntWork() {
  console.log('\n❌ What DOESN\'T Work:\n');
  
  const problematicExamples = [
    // This fails because of quotes in JSX
    '<DataObject data={{key: "value"}} />',
    
    // This fails because of complex object syntax
    '<DataObject data={{user: {name: "John", age: 30}}} />',
    
    // This fails because of array syntax
    '<DataObject data={{items: ["a", "b", "c"]}} />'
  ];

  problematicExamples.forEach((example, index) => {
    console.log(`${index + 1}. ${example}`);
    console.log('   ❌ Fails due to JSX parsing limitations\n');
  });
}

async function main() {
  try {
    await demonstrateJSXObjectPassing();
    await showWhatDoesntWork();
    
    console.log('💡 Key Takeaways:');
    console.log('• Use template variables for complex objects');
    console.log('• Use JSON strings for simple inline objects');
    console.log('• Combine both approaches as needed');
    console.log('• Avoid complex object literals directly in JSX attributes');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
