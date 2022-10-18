import { Either } from './either';
import { DomainException } from './errors';

export interface UseCase {
  execute(...args: any[]): Promise<Either<DomainException, any>>;
}
