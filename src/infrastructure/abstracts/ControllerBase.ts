import { Response } from 'express';


export abstract class ControllerBase {
   protected response<T = null>(res: Response, message: string, data: T = null as T, status: 'success' | 'error', code?: number): Response {
    const statusCode = code ?? (status === 'success' ? 200 : 400);
    return res.status(statusCode).json({
      message,
      status,
      data,
    });
  }
}
