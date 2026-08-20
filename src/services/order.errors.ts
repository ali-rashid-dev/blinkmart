export class OrderCannotCancelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderCannotCancelError";
  }
}

export class EmptyCartError extends Error {
  constructor() {
    super("Your cart is empty. Add items to cart before placing an order.");
    this.name = "EmptyCartError";
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStatusTransitionError";
  }
}

