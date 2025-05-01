import express, { type NextFunction } from "express";
import { HttpError, HttpErrorHandler } from "./error-classes";


export function errorHandler(err: any, _req: express.Request, res: express.Response, _next: NextFunction) {
	let httpError: HttpError;

	if (err instanceof HttpError)
		httpError = err;
	else if (err instanceof Error)
		httpError = new HttpError(500, err.message, err);
	else
		httpError = new HttpError(500, undefined, err);

	const handler = new HttpErrorHandler(httpError);
	res.status(handler.status).json(handler);
}