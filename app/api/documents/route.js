import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { chunkText } from '@/lib/chunk';

// IMPORTANT:
// pdf-parse worker must be imported before pdf-parse itself.
// import { CanvasFactory } from 'pdf-parse/worker';
// import { PDFParse } from 'pdf-parse';



export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const docs = await db.document.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      documents: docs.map(({ content, ...d }) => ({
        ...d,
        preview: content.slice(0, 180),
      })),
    });
  } catch (error) {
    console.error('GET /api/documents error:', error);

    return NextResponse.json(
      {
        error:
          error?.message || 'Unable to load materials.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = String(
      new URL(request.url).searchParams.get('id') || ''
    );

    if (!id) {
      return NextResponse.json(
        { error: 'Document id is required.' },
        { status: 400 }
      );
    }

    const doc = await db.document.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found.' },
        { status: 404 }
      );
    }

    await db.document.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error('DELETE /api/documents error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Delete failed.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let parser = null;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const form = await request.formData();

    const file = form.get('file');

    const title = String(
      form.get('title') ||
      file?.name ||
      'Untitled material'
    );

    if (
      !file ||
      typeof file.arrayBuffer !== 'function'
    ) {
      return NextResponse.json(
        { error: 'PDF file is required.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: 'Maximum file size is 10MB.',
        },
        { status: 400 }
      );
    }

    // Read uploaded PDF
    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    if (!buffer.length) {
      return NextResponse.json(
        { error: 'The uploaded PDF is empty.' },
        { status: 400 }
      );
    }

    // IMPORTANT:
    // Convert Buffer into Uint8Array for pdf-parse v2.
    const { PDFParse } = await import('pdf-parse');

    parser = new PDFParse({
      data: new Uint8Array(buffer),
    });

    const parsed = await parser.getText();

    const content = parsed?.text?.trim() || '';

    if (!content) {
      return NextResponse.json(
        {
          error:
            'No text could be extracted from this PDF. The PDF may be scanned/image-only.',
        },
        { status: 400 }
      );
    }

    const doc = await db.document.create({
      data: {
        userId: user.id,
        title,
        fileName: file.name,
        content,
      },
    });

    const chunks = chunkText(content);

    if (chunks.length > 0) {
      await db.chunk.createMany({
        data: chunks.map((chunk, index) => ({
          documentId: doc.id,
          content: chunk,
          position: index,
        })),
      });
    }

    return NextResponse.json({
      ok: true,
      id: doc.id,
      title,
      chunks: chunks.length,
    });
  } catch (error) {
    console.error('POST /api/documents error:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Upload failed. Please try another PDF.',
      },
      { status: 500 }
    );
  } finally {
    // Always release PDF parser resources.
    if (parser) {
      try {
        await parser.destroy();
      } catch (destroyError) {
        console.error(
          'PDF parser cleanup error:',
          destroyError
        );
      }
    }
  }
}