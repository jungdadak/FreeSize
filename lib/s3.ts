import { S3Client } from '@aws-sdk/client-s3';
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_KEY!,
  },
});

export const generateUniqueFileName = (
  clientIp: string,
  originalFileName: string
): string => {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  return `${clientIp}-${uuid}-${timestamp}-${originalFileName}`;
};
