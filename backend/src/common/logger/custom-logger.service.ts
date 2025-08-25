import { LoggerService, Injectable, Scope, ConsoleLogger } from "@nestjs/common";

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends ConsoleLogger implements LoggerService {
  // Add the method name to the context
  protected formatContext(context?: string, methodName?: string): string {
    let baseContext = context || this.context || "Application";
    if (methodName) {
      baseContext = `${baseContext}.${methodName}`;
    }
    return baseContext;
  }

  log(message: any, context?: string): void;
  log(message: any, ...optionalParams: [...any, string?]): void;
  log(message: any, ...optionalParams: any[]) {
    const methodName = typeof optionalParams[optionalParams.length - 1] === "string" ? optionalParams.pop() : undefined;
    const context = typeof optionalParams[0] === "string" ? optionalParams.shift() : this.context;
    super.log(message, this.formatContext(context, methodName), ...optionalParams);
  }

  error(message: any, trace?: string, context?: string): void;
  error(message: any, ...optionalParams: [...any, string?, string?]): void;
  error(message: any, ...optionalParams: any[]) {
    const methodName = typeof optionalParams[optionalParams.length - 1] === "string" ? optionalParams.pop() : undefined;
    const context = typeof optionalParams[optionalParams.length - 1] === "string" ? optionalParams.pop() : this.context;
    const trace = typeof optionalParams[0] === "string" ? optionalParams.shift() : undefined; // Assuming trace might be the first string after message

    super.error(message, trace, this.formatContext(context, methodName), ...optionalParams);
  }

  warn(message: any, context?: string): void;
  warn(message: any, ...optionalParams: [...any, string?]): void;
  warn(message: any, ...optionalParams: any[]) {
    const methodName = typeof optionalParams[optionalParams.length - 1] === "string" ? optionalParams.pop() : undefined;
    const context = typeof optionalParams[0] === "string" ? optionalParams.shift() : this.context;
    super.warn(message, this.formatContext(context, methodName), ...optionalParams);
  }

  debug(message: any, context?: string): void;
  debug(message: any, ...optionalParams: [...any, string?]): void;
  debug(message: any, ...optionalParams: any[]) {
    const methodName = typeof optionalParams[optionalParams.length - 1] === "string" ? optionalParams.pop() : undefined;
    const context = typeof optionalParams[0] === "string" ? optionalParams.shift() : this.context;
    super.debug(message, this.formatContext(context, methodName), ...optionalParams);
  }

  verbose(message: any, context?: string): void;
  verbose(message: any, ...optionalParams: [...any, string?]): void;
  verbose(message: any, ...optionalParams: any[]) {
    const methodName = typeof optionalParams[optionalParams.length - 1] === "string" ? optionalParams.pop() : undefined;
    const context = typeof optionalParams[0] === "string" ? optionalParams.shift() : this.context;
    super.verbose(message, this.formatContext(context, methodName), ...optionalParams);
  }
}
