import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export default async function handler(req: any, res: any) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }
  
  try {
    const s3 = new S3Client({
      region: process.env.MY_AWS_REGION || process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
      }
    });

    const bucket = process.env.MY_AWS_S3_BUCKET || process.env.AWS_S3_BUCKET;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3.send(command);
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("S3 Delete Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

