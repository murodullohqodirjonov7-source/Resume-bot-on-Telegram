import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import https from 'https';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import type { Context } from 'telegraf';
import { ResumeData } from './types';

function downloadFile(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https
      .get(url, (response) => {
        if (
          response.statusCode !== undefined &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          file.close();
          fs.unlink(filePath, () =>
            downloadFile(response.headers.location as string, filePath)
              .then(resolve)
              .catch(reject)
          );
          return;
        }
        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(filePath, () =>
            reject(new Error(`Photo download failed: ${response.statusCode}`))
          );
          return;
        }
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
      })
      .on('error', (err) => {
        file.close();
        fs.unlink(filePath, () => reject(err));
      });
  });
}

async function downloadPhotoIfPresent(
  data: ResumeData,
  userId: number,
  ctx: Context | undefined,
  resumesDir: string,
  errorLabel: string
): Promise<string | null> {
  if (!data.photo || data.photo === '—' || !ctx) return null;
  try {
    const photoUrl = await ctx.telegram.getFileLink(data.photo);
    const photoPath = path.join(resumesDir, `photo_${userId}_${Date.now()}.jpg`);
    await downloadFile(photoUrl.href ?? photoUrl.toString(), photoPath);
    return photoPath;
  } catch (e) {
    console.log(errorLabel, (e as Error).message);
    return null;
  }
}

export async function generateResumePDF(
  data: ResumeData,
  userId: number,
  ctx?: Context
): Promise<string> {
  const resumesDir = path.join(__dirname, '..', 'resumes');
  fs.mkdirSync(resumesDir, { recursive: true });
  const fileName = `resume_${userId}_${Date.now()}.pdf`;
  const filePath = path.join(resumesDir, fileName);
  let photoPath: string | null = null;

  try {
    photoPath = await downloadPhotoIfPresent(
      data,
      userId,
      ctx,
      resumesDir,
      "Foto PDFga qo'shilmadi:"
    );

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 45, bufferPages: true });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const dark = '#1F2937';
      const accent = '#2563EB';

      doc.rect(0, 0, 595, 145).fill(dark);

      if (photoPath && fs.existsSync(photoPath)) {
        doc.image(photoPath, 450, 25, { fit: [100, 100], align: 'center', valign: 'center' });
      }

      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(26)
        .text(data.name || 'Rezyume', 45, 35, { width: 390 });
      doc
        .fillColor('#DCE7F5')
        .font('Helvetica')
        .fontSize(14)
        .text(data.field || '', 45, 72, { width: 390 });
      doc
        .fillColor('#FFFFFF')
        .fontSize(9)
        .text(
          `${data.phone || ''}  |  ${data.email && data.email !== '—' ? data.email : ''}`,
          45,
          105,
          { width: 390 }
        );

      let y = 175;
      const section = (title: string) => {
        if (y > 720) {
          doc.addPage();
          y = 50;
        }
        doc.fillColor(accent).font('Helvetica-Bold').fontSize(15).text(title, 45, y);
        doc.moveTo(45, y + 21).lineTo(550, y + 21).lineWidth(1).strokeColor('#D8E0EA').stroke();
        y += 34;
      };
      const value = (text?: string) => {
        const str = text && text !== '—' ? String(text) : '';
        if (!str) return;
        if (y > 735) {
          doc.addPage();
          y = 50;
        }
        doc
          .fillColor('#374151')
          .font('Helvetica')
          .fontSize(10.5)
          .text(str, 45, y, { width: 505, lineGap: 3 });
        y = doc.y + 12;
      };

      section('ALOQA VA SHAXSIY MA’LUMOTLAR');
      value(`Shahar: ${data.city || '—'}`);
      value(`Telefon: ${data.phone || '—'}`);
      value(`Email: ${data.email || '—'}`);
      value(`Telegram / LinkedIn: ${data.links || '—'}`);

      if (data.about && data.about !== '—') {
        section('MEN HAQIMDA');
        value(data.about);
      }
      if (data.experience && data.experience !== '—') {
        section('ISH TAJRIBASI');
        value(data.experience);
      }
      if (data.education && data.education !== '—') {
        section('TA’LIM');
        value(data.education);
      }
      if (data.skills && data.skills !== '—') {
        section('KO‘NIKMALAR');
        value(
          data.skills
            .split(',')
            .map((s) => `• ${s.trim()}`)
            .join('   ')
        );
      }
      if (data.languages && data.languages !== '—') {
        section('TILLAR');
        value(data.languages);
      }
      if (data.salary && data.salary !== '—') {
        section('KUTILAYOTGAN MAOSH');
        value(data.salary);
      }

      doc
        .fontSize(8)
        .fillColor('#9CA3AF')
        .text('Telegram Resume Bot orqali avtomatik yaratildi', 45, 805, {
          align: 'center',
          width: 505,
        });
      doc.end();
      stream.on('finish', () => resolve());
      stream.on('error', reject);
    });

    return filePath;
  } finally {
    if (photoPath && fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
  }
}

export async function generateResumeDOCX(
  data: ResumeData,
  userId: number,
  ctx?: Context
): Promise<string> {
  const resumesDir = path.join(__dirname, '..', 'resumes');
  fs.mkdirSync(resumesDir, { recursive: true });
  const fileName = `resume_${userId}_${Date.now()}.docx`;
  const filePath = path.join(resumesDir, fileName);
  let photoPath: string | null = null;

  try {
    photoPath = await downloadPhotoIfPresent(
      data,
      userId,
      ctx,
      resumesDir,
      "Foto DOCXga qo'shilmadi:"
    );

    const children: Paragraph[] = [];
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.name || 'Rezyume', bold: true, size: 36 })],
        spacing: { after: 100 },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.field || '', bold: true, size: 24 })],
        spacing: { after: 120 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${data.phone || ''}${data.email && data.email !== '—' ? '  |  ' + data.email : ''}`,
            size: 20,
          }),
        ],
        spacing: { after: 250 },
      })
    );

    const addSection = (title: string, value?: string) => {
      if (!value || value === '—') return;
      children.push(
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 220, after: 100 },
        })
      );
      if (title === 'KO‘NIKMALAR') {
        String(value)
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
          .forEach((skill) => {
            children.push(
              new Paragraph({ text: skill, bullet: { level: 0 }, spacing: { after: 50 } })
            );
          });
      } else {
        children.push(
          new Paragraph({
            text: String(value),
            spacing: { after: 100, line: 280 },
          })
        );
      }
    };

    addSection(
      'ALOQA VA SHAXSIY MA’LUMOTLAR',
      `Shahar: ${data.city || '—'}\nTelefon: ${data.phone || '—'}\nEmail: ${data.email || '—'}\nTelegram / LinkedIn: ${data.links || '—'}`
    );
    addSection('MEN HAQIMDA', data.about);
    addSection('ISH TAJRIBASI', data.experience);
    addSection('TA’LIM', data.education);
    addSection('KO‘NIKMALAR', data.skills);
    addSection('TILLAR', data.languages);
    addSection('KUTILAYOTGAN MAOSH', data.salary);

    children.push(
      new Paragraph({
        text: 'Telegram Resume Bot orqali avtomatik yaratildi',
        alignment: AlignmentType.CENTER,
        spacing: { before: 300 },
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } finally {
    if (photoPath && fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
  }
}

export function cleanOldResumes(maxAgeHours = 24): void {
  const resumesDir = path.join(__dirname, '..', 'resumes');
  if (!fs.existsSync(resumesDir)) return;
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  for (const file of fs.readdirSync(resumesDir)) {
    const filePath = path.join(resumesDir, file);
    const stat = fs.statSync(filePath);
    if (now - stat.mtimeMs > maxAge) fs.unlinkSync(filePath);
  }
}
