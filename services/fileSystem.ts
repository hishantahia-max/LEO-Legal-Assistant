
import { ScannedFile } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class FileSystemService {
  
  /**
   * Request user to select a directory and recursively scan it for legal documents.
   */
  async scanDirectory(): Promise<ScannedFile[]> {
    if (!('showDirectoryPicker' in window)) {
      throw new Error("File System Access API is not supported in this browser.");
    }

    try {
      // @ts-ignore - TypeScript might not have definitions for this yet in all environments
      const dirHandle = await window.showDirectoryPicker();
      const files: ScannedFile[] = [];
      
      await this.recursiveScan(dirHandle, '', files);
      return files;
    } catch (error: any) {
      if (error.name === 'AbortError') return []; // User cancelled
      throw error;
    }
  }

  private async recursiveScan(
    dirHandle: FileSystemDirectoryHandle, 
    path: string, 
    results: ScannedFile[]
  ) {
    // @ts-ignore
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;
      
      if (entry.kind === 'file') {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        
        // Filter for relevant document types
        if (this.isRelevantFile(file.name, file.type)) {
          results.push({
            id: uuidv4(),
            handle: fileHandle,
            path: entryPath,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            isImported: false
          });
        }
      } else if (entry.kind === 'directory') {
        // Recursive dive
        await this.recursiveScan(entry as FileSystemDirectoryHandle, entryPath, results);
      }
    }
  }

  private isRelevantFile(name: string, type: string): boolean {
    const ext = name.split('.').pop()?.toLowerCase();
    const validExts = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'txt'];
    return validExts.includes(ext || '') || type === 'application/pdf' || type.startsWith('image/');
  }

  /**
   * Convert a FileHandle to a standard File object for processing
   */
  async getFileFromHandle(handle: FileSystemFileHandle): Promise<File> {
    return await handle.getFile();
  }
}

export const fileSystemService = new FileSystemService();
