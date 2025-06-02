import bcrypt from 'bcryptjs'; // Import the default export

async function generateHash() {
  const hashedPassword = await bcrypt.hash('password123', 10); // Use bcrypt.hash
  console.log(hashedPassword);
}

generateHash();