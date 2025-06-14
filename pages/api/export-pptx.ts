import type { NextApiRequest, NextApiResponse } from 'next';
import pptxgen from 'pptxgenjs';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const presentation = req.body;
    const pptx = new pptxgen();

    // Add title slide
    const titleSlide = pptx.addSlide();
    titleSlide.addText(presentation.title || 'Untitled Presentation', {
      x: 1,
      y: 2,
      w: 8,
      h: 2,
      fontSize: 32,
      bold: true,
      align: 'center',
    });

    // Add content slides
    presentation.slides?.forEach((slide: any) => {
      const contentSlide = pptx.addSlide();
      contentSlide.addText(slide.title || 'Untitled Slide', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 24,
        bold: true,
      });
      if (slide.content && Array.isArray(slide.content)) {
        const bulletText = slide.content.map((item: string) => `• ${item}`).join('\n');
        contentSlide.addText(bulletText, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 5,
          fontSize: 16,
          valign: 'top',
        });
      }
    });

    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    let pptxBuffer: Buffer;
    if (typeof buffer === 'string') {
      pptxBuffer = Buffer.from(buffer, 'binary');
    } else if (buffer instanceof ArrayBuffer) {
      pptxBuffer = Buffer.from(new Uint8Array(buffer));
    } else if (buffer instanceof Uint8Array) {
      pptxBuffer = Buffer.from(buffer);
    } else if (typeof Blob !== 'undefined' && buffer instanceof Blob) {
      const ab = await buffer.arrayBuffer();
      pptxBuffer = Buffer.from(new Uint8Array(ab));
    } else {
      throw new Error('Unknown PPTX buffer type');
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${presentation.title || 'presentation'}.pptx"`);
    res.send(pptxBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PPTX' });
  }
}
