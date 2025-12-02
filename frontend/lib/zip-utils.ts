import JSZip from 'jszip';

interface File {
    name: string;
    content: string;
}

export async function downloadProjectAsZip(projectName: string, files: File[]) {
    const zip = new JSZip();

    files.forEach((file) => {
        zip.file(file.name, file.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });

    // Create a download link programmatically to avoid 'file-saver' dependency if not needed, 
    // or use file-saver if installed. I'll use a simple DOM method to avoid extra deps if possible, 
    // but I already installed jszip. I'll use a helper.

    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
