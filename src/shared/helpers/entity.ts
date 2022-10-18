import { Either } from './either';
import { DomainException } from './errors';

export interface DomainEntity<T> {
  build(...args: any[]): Either<DomainException, T>;
}

/* class decorator */
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}
