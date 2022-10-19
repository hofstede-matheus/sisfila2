import { EncryptionService } from '../../domain/services/EncryptionService';
import { hash, compare } from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptEncryptionService implements EncryptionService {
  async encrypt(string: string): Promise<string> {
    const encryptedString = await hash(string, 8);
    return encryptedString;
  }
  async check(hash: string, string: string): Promise<boolean> {
    try {
      const comparisonResult = await compare(string, hash);
      return comparisonResult;
    } catch (error) {
      return false;
    }
  }
}
