import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'object' && payload !== null && 'success' in payload) {
        response.status(status).json(payload);
        return;
      }

      response.status(status).json({
        success: false,
        data: null,
        error: typeof payload === 'string' ? payload : exception.message,
      });
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const error =
        exception.code === 'P2002'
          ? 'Unique constraint violation'
          : exception.code === 'P2025'
            ? 'Record not found'
            : 'Database request failed';

      response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        data: null,
        error,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      data: null,
      error: 'Internal server error',
    });
  }
}
