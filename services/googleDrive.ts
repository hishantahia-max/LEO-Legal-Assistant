
const CLIENT_ID = '889369931149-161616161616.apps.googleusercontent.com'; // Placeholder - Replace with your actual Client ID
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME = 'legal_dossier_backup.enc';

// AES-GCM Encryption Helpers
async function generateKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptData(data: any, pin: string): Promise<Blob> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await generateKey(pin, salt);
  
  const enc = new TextEncoder();
  const encoded = enc.encode(JSON.stringify(data));
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );

  // Combine Salt + IV + Encrypted Data
  const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
  buffer.set(salt, 0);
  buffer.set(iv, salt.byteLength);
  buffer.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);

  return new Blob([buffer], { type: 'application/octet-stream' });
}

async function decryptData(blob: Blob, pin: string): Promise<any> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  const salt = buffer.slice(0, 16);
  const iv = buffer.slice(16, 28);
  const data = buffer.slice(28);

  const key = await generateKey(pin, salt);
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decrypted));
}

export class GoogleDriveService {
  private tokenClient: any;
  private accessToken: string | null = null;

  constructor() {
    // We defer initialization until needed to avoid errors if script isn't loaded
  }

  private initializeGSI(): Promise<void> {
    return new Promise((resolve) => {
        if ((window as any).google && (window as any).google.accounts) {
            this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (response: any) => {
                if (response.access_token) {
                    this.accessToken = response.access_token;
                }
                },
            });
            resolve();
        } else {
            console.error("Google Identity Services not loaded");
            resolve();
        }
    });
  }

  public async signIn(): Promise<void> {
    if (!this.tokenClient) await this.initializeGSI();
    
    return new Promise((resolve, reject) => {
      if (this.accessToken) {
        resolve();
        return;
      }
      
      if (!this.tokenClient) {
          reject("Google Identity SDK not available.");
          return;
      }

      this.tokenClient.callback = (resp: any) => {
         if (resp.error !== undefined) {
           reject(resp);
           throw resp;
         }
         this.accessToken = resp.access_token;
         resolve();
      };
      
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  public async syncToCloud(data: any, pin: string): Promise<void> {
    if (!this.accessToken) await this.signIn();

    const blob = await encryptData(data, pin);
    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/octet-stream',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    // Check for existing file to update
    const existingFileId = await this.findBackupFileId();
    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (existingFileId) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: form,
    });
  }

  public async syncFromCloud(pin: string): Promise<any> {
    if (!this.accessToken) await this.signIn();

    const fileId = await this.findBackupFileId();
    if (!fileId) return null;

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    const blob = await response.blob();
    return await decryptData(blob, pin);
  }

  private async findBackupFileId(): Promise<string | null> {
    const query = `name = '${BACKUP_FILENAME}' and trashed = false`;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
    const result = await response.json();
    return result.files && result.files.length > 0 ? result.files[0].id : null;
  }
}

export const googleDriveService = new GoogleDriveService();
