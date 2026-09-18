import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  const { filename, contentType } = req.body;
  if (!filename || !contentType) {
    return res.status(400).json({ error: "Missing filename or contentType" });
  }
  
  try {
    const s3 = new S3Client({
      region: "eu-north-1", // Hardcoded from user screenshot to bypass Vercel env bugs
      credentials: {
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || process.env.MY_AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || process.env.MY_AWS_SECRET_ACCESS_KEY || "",
      }
    });

    const key = `lectures/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: "eduscribe-videos-123", // Hardcoded from user screenshot
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    return res.status(200).json({ 
      url, 
      key, 
      publicUrl: `https://eduscribe-videos-123.s3.eu-north-1.amazonaws.com/${key}`
    });
  } catch (error: any) {
    console.error("S3 Presign Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

