// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

const ALLOWED_TYPES = ['products', 'categories'] as const;
type UploadType = (typeof ALLOWED_TYPES)[number];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as string; // 'products' | 'categories'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(type as UploadType)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${ALLOWED_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Different sizing per type — categories are usually small icons/tiles,
  // products need more room for detail shots
  const transformation =
    type === 'categories'
      ? [{ width: 400, height: 400, crop: 'fill', gravity: 'auto' }]
      : [{ width: 800, height: 800, crop: 'limit' }];

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `grocery-app/${type}`, // grocery-app/products or grocery-app/categories
          transformation,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });

  return NextResponse.json(result);
}