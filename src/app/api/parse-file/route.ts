import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();

    // Handle text-based files directly
    if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      const text = await file.text();
      return NextResponse.json({ text, fileName: file.name });
    }

    // Handle PDF files
    if (fileName.endsWith('.pdf')) {
      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        // Dynamic import to avoid webpack issues
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        return NextResponse.json({ text: data.text, fileName: file.name, pages: data.numpages });
      } catch {
        // Fallback: extract text between parentheses from raw PDF (basic extraction)
        const rawText = buffer.toString('utf-8');
        const textParts: string[] = [];
        const regex = /\(([^)]+)\)/g;
        let match;
        while ((match = regex.exec(rawText)) !== null) {
          const part = match[1];
          // Filter out PDF commands, keep actual text
          if (part.length > 1 && !part.startsWith('/') && !part.includes('obj') && !part.includes('stream')) {
            textParts.push(part);
          }
        }
        const extractedText = textParts.join('\n');
        if (extractedText.length > 20) {
          return NextResponse.json({ text: extractedText, fileName: file.name, method: 'fallback' });
        }
        return NextResponse.json({ error: 'Could not extract text from this PDF. Please paste the text manually.' }, { status: 422 });
      }
    }

    // Unsupported file type
    return NextResponse.json(
      { error: `Unsupported file type: ${fileName.split('.').pop()}. Please use .txt, .csv, or .pdf` },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'File parsing failed' },
      { status: 500 }
    );
  }
}
