// pages/api/posts.js

import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const postsFilePath = path.join(process.cwd(), "data", "posts.json");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = formidable({ multiples: false, uploadDir: "./public/uploads", keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ error: "Error parsing form data" });
      }

      try {
        const image = files.image?.[0];
        const imagePath = path.basename(image.filepath);

        const newPost = {
          user: fields.user?.[0] || "Anonymous",
          description: fields.description?.[0] || "",
          imagePath,
          createdAt: new Date().toISOString(),
        };

        // Read existing posts
        let posts = [];
        if (fs.existsSync(postsFilePath)) {
          const fileData = fs.readFileSync(postsFilePath, "utf-8");
          posts = JSON.parse(fileData || "[]");
        }

        // Add new post
        posts.unshift(newPost);

        // Save back to file
        fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));

        return res.status(200).json({ success: true, post: newPost });
      } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Failed to save post" });
      }
    });
  } else if (req.method === "GET") {
    try {
      if (!fs.existsSync(postsFilePath)) {
        return res.status(200).json({ posts: [] });
      }

      const fileData = fs.readFileSync(postsFilePath, "utf-8");
      const posts = JSON.parse(fileData || "[]");

      return res.status(200).json({ posts });
    } catch (error) {
      console.error("Error reading posts file:", error);
      return res.status(500).json({ error: "Unable to read posts" });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
