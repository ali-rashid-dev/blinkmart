export class OrderCannotCancelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderCannotCancelError";
  }
}

