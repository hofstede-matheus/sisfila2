export class DomainException extends Error {
  constructor(public message: string) {
    super(message);
    console.info(
      this.constructor.name,
      DomainException.name,
      '\x1b[35m',
      message,
      '\x1b[0m',
    );
  }
}
