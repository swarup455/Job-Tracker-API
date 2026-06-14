import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const extractTextFromFile = async (
    file: Express.Multer.File
): Promise<string> => {
    if (file.mimetype === "application/pdf") {
        const parser = new PDFParse({ data: file.buffer });
        const result = await parser.getText();
        return result.text.trim();
    }

    if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        return result.value.trim();
    }

    throw new Error("Unsupported file type");
};