import { NextFunction, Request, Response } from "express";

export interface BaseErrorHandler {
  (req: Request, res: Response, exception: Error): void;
}

type Class<T> = abstract new (...args: any[]) => T;

/**
  A Class for defining special RestAPI errors, that are serialized
  and sent to the receiver as a JSON response with a special status code.
  To define custom error, derive new class and set up `code` field:
  ```ts
  class MyError extends BaseError {
    public static code = 500;
  }
  ```

  These errors can be registered in `ExceptionHandler` class with predefined
  static handler: `BaseError.getHandler`.

  Also this error class allows to pass `context` object into constructor, which is later serialized in json response:
  ```ts
  throw new MyError("My error occured", {"some": "context"})
  // becomes
  //    {"context": {"some": "context"}}
  ```
*/
export abstract class BaseError extends Error {
  public static code: Number;
  public context: object;
  constructor(message: string, context: object = {}) {
    super(message);
    this.context = context;
  }

  public static getHandler(): BaseErrorHandler {
    return (_: Request, res: Response, exception: Error) => {
      const casted = exception as BaseError;
      res
        // @ts-ignore
        .status(casted.constructor.code)
        .send({ context: casted.context });
    };
  }
}

export class ValidationError extends BaseError {
  public static code = 422;
}

export class NotFoundError extends BaseError {
  public static code = 404;
}

interface AsyncRun {
  (): Promise<void>;
}

/**
  A Class to store and call error handlers for **Express.js** route functions.
  An error handler is a function that accepts `Request`, `Response` and `Error`.

  _E.G._:
  Suppose you have error handler (`handle_A`), that can handle error of type `A`.
  To register it in exception handler, you simply need to call `.register(A, handle_a)`.
  Then, when you handle route request, just run it in safe exception hadler wrapper:
  ```ts
  eh.register(A, handle_A);
  ...
  app.get("/", async (req, res) => {
    eh.withExcepionHandler(req, res, async () => {
      await my_service_function_that_can_throw_A(req, res);
    })
  })
  ```
*/
export class ExceptionHandler {
  private exceptionsMap: Map<Class<Error>, BaseErrorHandler> = new Map();

  public register(
    exceptionClass: Class<Error>,
    errorHandler: BaseErrorHandler,
  ) {
    this.exceptionsMap.set(exceptionClass, errorHandler);
  }

  public withExcepionHandler(
    err: Error,
    req: Request,
    res: Response,
    _: NextFunction,
  ) {
    const handler = this.exceptionsMap.get(err.constructor as Class<Error>);
    if (handler !== undefined) {
      handler(req, res, err);
    } else {
      res.status(500).send({ context: err });
    }
  }
}
