import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ObjectCannedACL,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import httpStatus from 'http-status'; 
import config from '../config';
import { s3Client } from '../constants/aws';
import AppError from '../errors/AppError';

const getS3ErrorMessage = (error: any) => {
  if (error?.code === 'ENOTFOUND') {
    return `File Upload failed: unable to resolve Spaces endpoint "${error.hostname}". Please check SPACES_API/S3_BASE_URL.`;
  }

  return 'File Upload failed';
};

export const getFileExtension = (file: any) => {
  const originalNameExtension = file?.originalname?.split('.').pop();
  if (originalNameExtension && originalNameExtension !== file.originalname) {
    return originalNameExtension.toLowerCase();
  }

  const mimetypeExtension = file?.mimetype?.split('/').pop();
  return mimetypeExtension?.replace('jpeg', 'jpg') || 'bin';
};

export const buildS3FileName = (directory: string, file: any) => {
  const cleanDirectory = directory.replace(/\/+$/, '');
  const extension = getFileExtension(file);
  const uniqueName = `${Math.floor(100000 + Math.random() * 900000)}-${Date.now()}`;

  return `${cleanDirectory}/${uniqueName}.${extension}`;
};

//upload a single file
export const uploadToS3 = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { file, fileName }: { file: any; fileName: string },
): Promise<string | null> => {
  const command = new PutObjectCommand({
    Bucket: config.aws.bucket,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: ObjectCannedACL.public_read, //access public read
  });

  try {
    const key = await s3Client.send(command);
    if (!key) {
      throw new AppError(httpStatus.BAD_REQUEST, 'File Upload failed');
    }
    const url = `${config?.aws?.s3BaseUrl}/${fileName}`;

    return url;
  } catch (error: any) {
    console.error('S3 upload error:', {
      message: error.message,
      code: error.code,
      hostname: error.hostname,
      attempts: error.$metadata?.attempts,
    });
    throw new AppError(httpStatus.BAD_REQUEST, getS3ErrorMessage(error));
  }
};
 
// delete file from s3 bucket
export const deleteFromS3 = async (key: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.aws.bucket,
      Key: key,
    });
    await s3Client.send(command);
  } catch (error) {
    console.log('🚀 ~ deleteFromS3 ~ error:', error);
    throw new Error('s3 file delete failed');
  }
};

// upload multiple files

export const uploadManyToS3 = async (
  files: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: any;
    path: string;
    key?: string;
  }[],
): Promise<{ url: string; key: string }[]> => {
  try {
    const uploadPromises = files.map(async ({ file, path, key }) => {
      const newFileName = key
        ? key
        : `${Math.floor(100000 + Math.random() * 900000)}${Date.now()}`;

      const fileKey = `${path}/${newFileName}`;

      const command = new PutObjectCommand({
        Bucket: config.aws.bucket as string,
        Key: fileKey,
        Body: file?.buffer,
        ContentType: file.mimetype,
        ACL: ObjectCannedACL.public_read, //access public read
      });

      const nn = await s3Client.send(command);
      // const url = `${config?.aws?.s3BaseUrl}/${fileKey}`;
      const url = `${config?.aws?.s3BaseUrl}/${fileKey}`;
      return { url, key: newFileName };
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls;
  } catch (error: any) {
    console.error('S3 multi upload error:', {
      message: error.message,
      code: error.code,
      hostname: error.hostname,
      attempts: error.$metadata?.attempts,
    });
    throw new AppError(httpStatus.BAD_REQUEST, getS3ErrorMessage(error));
  }
};

export const deleteManyFromS3 = async (keys: string[]) => {
  try {
    const deleteParams = {
      Bucket: config.aws.bucket,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false,
      },
    };

    const command = new DeleteObjectsCommand(deleteParams);

    const response = await s3Client.send(command);

    return response;
  } catch (error) {
    console.error('Error deleting S3 files:', error);
    throw new AppError(httpStatus.BAD_REQUEST, 'S3 file delete failed');
  }
};
