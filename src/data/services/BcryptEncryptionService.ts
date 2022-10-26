import { EncryptionService } from '../../domain/services/EncryptionService';
import { hash, compare, genSalt } from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptEncryptionService implements EncryptionService {
  async encrypt(string: string): Promise<string> {
    // generate a new salt with:
    // await genSalt($rounds));
    const salt = await genSalt(10);
    // arbitrary strings will not work
    const encryptedString = await hash(string, salt);
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
