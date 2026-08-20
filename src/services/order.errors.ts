export class OrderCannotCancelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderCannotCancelError";
  }
}

export class InsufficientInventoryError extends Error {
  constructor(
    public productName: string,
    public productId: string,
    public requestedQuantity?: number,
    public availableInventory?: number | null
  ) {
    const details =
      availableInventory !== undefined && availableInventory !== null
        ? ` (${availableInventory} available, ${requestedQuantity ?? "more"} requested)`
        : "";
    super(`Insufficient inventory for product "${productName}"${details}.`);
    this.name = "InsufficientInventoryError";
  }
}

