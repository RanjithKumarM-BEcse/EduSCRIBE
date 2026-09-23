import { Router } from 'express';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.post('/upload', async (req, res) => {
  const { filename, contentType } = req.body;
  if (!filename || !contentType) {
    res.status(400).json({ error: "Missing filename or contentType" });
    return;
  }
  
  try {
    const s3 = new S3Client({
      region: process.env.MY_AWS_REGION || process.env.AWS_REGION || "eu-north-1",
      credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
      }
    });

    const key = `lectures/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const bucket = process.env.MY_AWS_S3_BUCKET || process.env.AWS_S3_BUCKET;
    const region = process.env.MY_AWS_REGION || process.env.AWS_REGION || "eu-north-1";

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    res.status(200).json({ 
      url, 
      key, 
      publicUrl: `https://${bucket}.s3.${region}.amazonaws.com/${key}`
    });
  } catch (error: any) {
    console.error("S3 Presign Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete', async (req, res) => {
  const { key } = req.body;
  try {
    const s3 = new S3Client({
      region: process.env.MY_AWS_REGION || process.env.AWS_REGION || "eu-north-1",
      credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
      }
    });
    
    const command = new DeleteObjectCommand({
      Bucket: process.env.MY_AWS_S3_BUCKET || process.env.AWS_S3_BUCKET,
      Key: key
    });
    
    await s3.send(command);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
