// Test script to verify password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;

const testPasswords = [
  "Password123!",      // Should pass
  "MyPass123@",        // Should pass
  "Test1234#",         // Should pass
  "Simple123.",        // Should pass
  "Complex99$",        // Should pass
  "password123",       // Should fail (no uppercase)
  "PASSWORD123",       // Should fail (no lowercase)
  "Password",          // Should fail (no number)
  "Password123",       // Should fail (no special char)
  "Pass123!",          // Should pass (8+ chars with all requirements)
];

console.log("Testing password validation regex:");
console.log("Regex pattern:", passwordRegex.toString());
console.log("\nTest results:");

testPasswords.forEach(password => {
  const isValid = passwordRegex.test(password);
  console.log(`"${password}" - ${isValid ? "✓ VALID" : "✗ INVALID"}`);
});