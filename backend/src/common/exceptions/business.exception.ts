import { HttpException, HttpStatus } from "@nestjs/common";

export class BusinessException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(
      {
        message,
        code,
        details,
        status,
      },
      status
    );
  }
}

export class ValidationException extends BusinessException {
  constructor(errors: any[]) {
    super("Validation failed", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", errors);
  }
}

export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`, HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND");
  }
}

export class DuplicateResourceException extends BusinessException {
  constructor(resource: string, field: string, value: any) {
    super(`${resource} with ${field} '${value}' already exists`, HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
  }
}

export class InsufficientStockException extends BusinessException {
  constructor(itemId: string, requested: number, available: number) {
    super("Insufficient stock", HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK", {
      itemId,
      requested,
      available,
    });
  }
}

export class InvalidTransactionException extends BusinessException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, "INVALID_TRANSACTION", details);
  }
}

export class PaymentProcessingException extends BusinessException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, "PAYMENT_PROCESSING_ERROR", details);
  }
}
