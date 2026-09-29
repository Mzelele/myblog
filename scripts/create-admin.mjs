import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { MongoClient } from 'mongodb';

const envPath = existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: envPath });

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password>');
  process.exit(1);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in .env');

  const dbName = process.env.MONGODB_DB_NAME || 'test';
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
  await client.connect();
  const db = client.db(dbName);

  const normalizedEmail = email.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 12);

  const existing = await db.collection('users').findOne({ email: normalizedEmail });
  if (existing) {
    console.log('User already exists:', existing.email);
    await client.close();
    return;
  }

  const result = await db.collection('users').insertOne({
    email: normalizedEmail,
    password: hashedPassword,
    name: 'Admin',
    role: 'admin',
  });

  console.log('Admin user created:', normalizedEmail, result.insertedId);
  await client.close();
}

main().catch(console.error);