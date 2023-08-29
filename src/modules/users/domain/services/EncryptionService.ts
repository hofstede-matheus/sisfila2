export interface EncryptionService {
  encrypt(string: string): Promise<string>;
  check(hash: string, string: string): Promise<boolean>;
}

export const EncryptionService = Symbol('EncryptionService');
