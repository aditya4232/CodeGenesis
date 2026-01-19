/**
 * Export Utilities for CodeGenesis Agent
 * Handles exporting artifacts to PDF, Excel, and PPTX
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';

// ============================================
// PDF EXPORT
// ============================================

/**
 * Export document to PDF
 */
export async function exportDocumentToPDF(title: string, htmlContent: string): Promise<void> {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Add title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, 20);

        // Add a line under title
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);

        // Convert HTML to text (simple approach)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        // Add content with word wrap
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(textContent, 170);
        doc.text(lines, 20, 35);

        // Save the PDF
        doc.save(`${title}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        throw new Error('Failed to export PDF');
    }
}

/**
 * Export spreadsheet to PDF
 */
export async function exportSpreadsheetToPDF(
    title: string,
    columns: string[],
    data: string[][]
): Promise<void> {
    try {
        const doc = new jsPDF({
            orientation: data[0]?.length > 5 ? 'landscape' : 'portrait',
        });

        // Add title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, 15);

        // Add table
        autoTable(doc, {
            head: [columns],
            body: data,
            startY: 25,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [79, 70, 229], // Indigo
                fontStyle: 'bold',
            },
        });

        doc.save(`${title}.pdf`);
    } catch (error) {
        console.error('Error exporting spreadsheet to PDF:', error);
        throw new Error('Failed to export spreadsheet to PDF');
    }
}

// ============================================
// EXCEL EXPORT
// ============================================

/**
 * Export data to Excel
 */
export async function exportToExcel(
    title: string,
    columns: string[],
    data: string[][]
): Promise<void> {
    try {
        // Create a new workbook
        const worksheet = XLSX.utils.aoa_to_sheet([columns, ...data]);

        // Set column widths
        const columnWidths = columns.map(() => ({ wch: 20 }));
        worksheet['!cols'] = columnWidths;

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Save file
        XLSX.writeFile(workbook, `${title}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw new Error('Failed to export Excel file');
    }
}

// ============================================
// POWERPOINT EXPORT
// ============================================

/**
 * Export presentation to PPTX
 */
export async function exportPresentationToPPTX(
    title: string,
    slides: Array<{ title: string; content: string }>
): Promise<void> {
    try {
        const pptx = new pptxgen();

        // Set presentation properties
        pptx.author = 'CodeGenesis AI';
        pptx.company = 'CodeGenesis';
        pptx.title = title;

        // Add each slide
        slides.forEach((slideData, index) => {
            const slide = pptx.addSlide();

            // Add background gradient
            slide.background = { fill: '000000' };

            // Add slide number
            slide.addText(`${index + 1}`, {
                x: '90%',
                y: '95%',
                fontSize: 10,
                color: '888888',
            });

            // Add title
            slide.addText(slideData.title, {
                x: 0.5,
                y: 0.5,
                w: '90%',
                h: 1,
                fontSize: 32,
                bold: true,
                color: 'FFFFFF',
            });

            // Add content (remove HTML tags)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = slideData.content;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';

            slide.addText(textContent, {
                x: 0.5,
                y: 2,
                w: '90%',
                h: 4,
                fontSize: 18,
                color: 'CCCCCC',
                valign: 'top',
            });
        });

        // Save the presentation
        await pptx.writeFile({ fileName: `${title}.pptx` });
    } catch (error) {
        console.error('Error exporting to PPTX:', error);
        throw new Error('Failed to export PowerPoint');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Download text file
 */
export function downloadTextFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Download JSON file
 */
export function downloadJSONFile(filename: string, data: any): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}
