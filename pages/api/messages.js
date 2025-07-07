import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "Missing from/to query params." });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const messages = await db
      .collection("messages")
      .find({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray();

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Internal error" });
  }
}
