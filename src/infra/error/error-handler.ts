import express from 'express';
import * as logger from '../../utils/logger';
import { HttpError, HttpErrorHandler } from './error-classes';

export function jsonParserHandler(err: unknown, _req: express.Request, _res: express.Response, _next: express.NextFunction) {
	if (err instanceof SyntaxError && 'body' in err)
		throw new HttpError(400, `Malformed JSON in Request Body: ${err.message}`, err);
	throw err;
}

function logError(req: express.Request, httpError: HttpError, err: unknown) {
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

export function errorHandler(err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) {
	const httpError = err instanceof HttpError
		? err
		: err instanceof Error
			? new HttpError(500, err.message, err)
			: new HttpError(500);

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