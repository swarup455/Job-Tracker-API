import mammoth from "mammoth";
const pdfParse = require("pdf-parse");

export const extractTextFromFile = async (
    file: Express.Multer.File
): Promise<string> => {
    if (file.mimetype === "application/pdf") {
        const data = await pdfParse(file.buffer);
        return data.text.trim();
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