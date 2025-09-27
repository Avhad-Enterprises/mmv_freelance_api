// import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from '../database/index.schema';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const isEmpty = (value: any): boolean => {
    if (value === null) {
        return true;
    } else if (typeof value !== 'number' && value === '') {
        return true;
    } else if (value === 'undefined' || value === undefined) {
        return true;
    } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
        return true;
    } else {
        return false;
    }
};

export const cleanObj = (input: any, allowedKeys: string[] = []) => {
    return Object.keys(input)
        .filter(key => allowedKeys.includes(key))
        .reduce((obj, key) => {
            obj[key] = input[key];
            return obj;
        }, {});
};

export const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});


export const uploadToAws = async (
    name: string,
    base64String: string,
): Promise<{ fileUrl: string }> => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    });

    const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
    if (!AWS_BUCKET_NAME) throw new Error("Missing AWS_BUCKET_NAME");

    const matches = base64String.match(/^data:(.+);base64,/);
    if (!matches) {
        throw new Error("Invalid base64 format");
    }

    const mimeType = matches[1];
    const extension = mimeType.split("/")[1] || "bin"; // fallback extension
    const baseName = name.substring(0, name.lastIndexOf(".")) || name;

    const base64Data = base64String.replace(/^data:(.+);base64,/, "");

    const buffer = Buffer.from(base64Data, "base64");

    const params = {
        Bucket: AWS_BUCKET_NAME,
        Key: `uploads/${baseName}.${extension}`,
        Body: buffer,
        ContentEncoding: "base64",
        ContentType: mimeType,
        ACL: "public-read",
    };

    try {
        const response = await s3.upload(params).promise();
        return { fileUrl: response.Location };
    } catch (error: any) {
        console.error("❌ AWS Upload Error:", error);
        throw new Error("Error uploading file to S3: " + error.message);
    }
};


