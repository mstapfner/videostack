"""S3 upload dependencies for handling file uploads."""
import os
import uuid
from typing import Optional
from fastapi import UploadFile, File, HTTPException, status
from pathlib import Path
import boto3
from config import get_settings

settings = get_settings()

async def upload_file_to_s3(
    file: UploadFile = File(...),
    folder: str = "uploads"
) -> str:
    """
    Upload a file to S3 and return the public URL.

    Args:
        file: The uploaded file
        folder: Folder within the bucket to store the file

    Returns:
        Public URL of the uploaded file
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )

        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        s3_key = f"{folder}/{unique_filename}"

        # Create S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        )

        # Read file content
        file_content = await file.read()

        # Upload to S3
        # Note: ACL parameter removed as it's not supported when bucket ACLs are disabled
        # Ensure your S3 bucket has a bucket policy that allows public read access to objects
        s3_client.put_object(
            Bucket=settings.s3_bucket_name,
            Key=s3_key,
            Body=file_content,
            ContentType=file.content_type
        )

        # Generate public URL
        public_url = f"https://{settings.s3_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"

        return public_url

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

def get_s3_client():
    """Get S3 client for dependency injection."""
    return boto3.client(
        's3',
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region
    )
