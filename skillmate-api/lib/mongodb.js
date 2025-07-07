const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("❌ Please define the MONGODB_URI environment variable in .env.local or .env");
}

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // Reuse the client in development to prevent too many connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Use new client in production
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

module.exports = clientPromise;
