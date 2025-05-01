import express from "express";
import * as Student from "../controller/student-controller";

export const studentRouter = express.Router();


function handleErrors<P, ResBody, ReqBody, ReqQuery, Locals extends Record<string, any>>(
	fn: (req: express.Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: express.Response<ResBody, Locals>, next?: express.NextFunction) => Promise<void> | void
) {
	return async (req: express.Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: express.Response<ResBody, Locals>, next: express.NextFunction) => {
		try {
			const response = fn(req, res, next);
			if (response instanceof Promise) {
				await response;
			}
		} catch (err) {
			next(err);
		}
	}
}

studentRouter.get('', handleErrors(Student.getAll));
studentRouter.get('/:id', handleErrors(Student.get));
studentRouter.post('', handleErrors(Student.post));
studentRouter.put('/:id', handleErrors(Student.put));
studentRouter.delete('/:id', handleErrors(Student.remove));

// TODO: Implement invalid route support
// Example: POST /student/:id -> 404 NOT FOUND
