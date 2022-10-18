export class DomainError extends Error {
  constructor(public message: string) {
    super(message);
    console.info(
      this.constructor.name,
      DomainError.name,
      '\x1b[35m',
      message,
      '\x1b[0m',
    );
  }
}
