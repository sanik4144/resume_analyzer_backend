const { PDFParse } = require('pdf-parse');

async function extractCV(pdfBuffer) {
    if (!pdfBuffer) {
        console.warn('⚠️ No file uploaded, skipping CV extraction.');
        return null;
    }

    try {
        const parser = new PDFParse({ data: pdfBuffer });
        const result = await parser.getText();
        return result.text;
    } catch (err) {
        console.warn('⚠️ Could not parse PDF:', err.message);
        return null;
    }
}

module.exports = { extractCV };