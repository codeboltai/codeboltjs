/**
 * A module for document utility functions.
 */
import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';

const docutils = {
    /**
     * Converts a PDF document to text.
     * @param pdf_path - The file path to the PDF document to be converted.
     * @returns {Promise<string>} A promise that resolves with the converted text.
     */
    pdf_to_text: (pdf_path: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                // Check if file exists
                if (!fs.existsSync(pdf_path)) {
                    return reject(new Error(`PDF file not found at path: ${pdf_path}`));
                }
                
                // Read the PDF file as buffer
                const dataBuffer = fs.readFileSync(pdf_path);
                
                // Parse the PDF document
                pdfParse(dataBuffer)
                    .then((data: { text: string }) => {
                        resolve(data.text);
                    })
                    .catch((error: Error) => {
                        reject(new Error(`Error parsing PDF: ${error.message}`));
                    });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    reject(new Error(`Error processing PDF: ${error.message}`));
                } else {
                    reject(new Error('Unknown error processing PDF'));
                }
            }
        });
    }
};

export default docutils; 