// /pages/api/users.ts
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const users = await db.collection("users").find({}).toArray();
    const usernames = users.map((u) => u.name); // or email if preferred

    res.status(200).json({ users: usernames });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
}
