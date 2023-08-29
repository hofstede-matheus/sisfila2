import { Either } from './either';
import { DomainError } from './errors';

export interface DomainEntity<T> {
  build(...args: any[]): Either<DomainError, T>;
}

/* class decorator */
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}
