import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import handleZodError from '../errors/HandleZodError';


const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = 'Something went wrong!';
  let errorMessage = err.message || '';
  let errorDetails: any = {
    message: err.message || '',
  };

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorDetails = simplifiedError?.errorDetails;
    errorMessage = simplifiedError?.errorMessage;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorMessage,
    errorDetails,
    stack: err?.stack,
  });
};

export default globalErrorHandler;