import { Either } from './either';
import { DomainError } from './errors';

export interface UseCase {
  execute(...args: any[]): Promise<Either<DomainError, any>>;
}
