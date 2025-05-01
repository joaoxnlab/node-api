import express, { type NextFunction, type Request, type Response } from 'express';
import * as logger from '../../utils/logger';
import { HttpError, HttpErrorHandler } from './error-classes';


export function errorHandler(err: unknown, req: express.Request, res: express.Response, _next: NextFunction) {
	let httpError: HttpError;

	if (err instanceof HttpError)
		httpError = err;
	else if (err instanceof Error)
		httpError = new HttpError(500, err.message, err);
	else
		httpError = new HttpError(500);

	const handler = new HttpErrorHandler(httpError);

	logger.error(req, handler);
	if (httpError.statusCode < 400 || httpError.statusCode >= 500)
		logger.error(req, httpError);
	else if ([401, 403, 404].includes(httpError.statusCode))
		logger.warn(req, httpError);
	else logger.debug(req, httpError);

	res.status(handler.status).json(handler);
}