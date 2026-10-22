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

export class InsufficientStockError extends Error {
  constructor(message = "One or more selected options no longer have enough stock. Review your cart.") {
    super(message);
    this.name = "InsufficientStockError";
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStatusTransitionError";
  }
}
