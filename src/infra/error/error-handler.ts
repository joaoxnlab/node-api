import { Request, Response, NextFunction } from 'express';
import * as logger from '@logger';
import {HttpError, HttpErrorHandler, SQLiteError} from './error-classes';

export function jsonParserHandler(err: unknown, _req: Request, _res: Response, _next: NextFunction) {
	if (err instanceof SyntaxError && 'body' in err)
		throw new HttpError(400, `Malformed JSON in Request Body: ${err.message}`, err);
	throw err;
}

function logError(req: Request, httpError: HttpError, err: unknown) {
	if (!(err instanceof Error)) {
		logger.fatal(req, "A non-error landed on errorHandler.", httpError);
		logger.warn(req, "Data landed on handler:", err);
	} else if (httpError.statusCode >= 500) {
		logger.error(req, httpError);
	} else if ([401, 403].includes(httpError.statusCode)) {
		logger.warn(req, httpError);
	} else logger.debug(req, httpError);

	if (err instanceof Error)
		logger.trace(req, "Error landed on handler:", err);
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
	const httpError = err instanceof HttpError
		? err
		: !(err instanceof Error)
			? new HttpError(500)
			: SQLiteError.isRawSQLiteError(err)
				? HttpError.fromSQLiteError(err)
				: new HttpError(500, err.message, err);

	const handler = new HttpErrorHandler(httpError);
	logger.error(req, handler);

	logError(req, httpError, err);

	res.status(handler.status).json(handler);
}

export function listenUnhandledRejections() {
	process.on('unhandledRejection', (reason, promise) => {
		logger.log(
			logger.LogLevel.FATAL, '(UNKNOWN method)', '(UNKNOWN url)', console.error,
			'UnhandledRejection fatal error:', reason
		);
		logger.log(
			logger.LogLevel.DEBUG, '(UNKNOWN method)', '(UNKNOWN url)', console.error,
			'Unhandled Promise:', promise
		)
	});
}