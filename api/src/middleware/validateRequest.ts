import { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';
import config from '../config';


const validateRequest = (schema: ZodObject) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    if (config.NODE_ENV === 'development') {
      const mappedBody = Object.entries(req.body).map(([key, value]) => ({
        Field: key,
        Value: value,
      }));
      console.table(mappedBody)
    }
    const parsedData = await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
    });
    req.body = parsedData.body;
    return next();
  });
};

export default validateRequest;