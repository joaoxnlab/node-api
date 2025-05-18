import type { NextFunction, Request, Response } from 'express';
import { HttpErrorHandler } from 'infra/error/error-classes';
import * as logger from '@logger';

export function initRequestLogger(req: Request, _res: Response, next: NextFunction) {
	logger.info(req, 'Initializing router. Body type:', typeof req.body);
	logger.debug(req, 'Body:', req.body);
	next();
}

export function enableLoggedResponses(req: Request, res: Response, next: NextFunction) {
	const originalSend = res.send;

	res.send = function (this: Response, body?: any) {
		const statusMessage = HttpErrorHandler.httpStatusNameMap[res.statusCode];
		logger.info(req, 'Responding with HttpStatus', res.statusCode, statusMessage);
		logger.debug(req, 'Response:', body);
		return originalSend.call(this, body);
	};
	next();
}
