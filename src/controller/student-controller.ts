import { type NextFunction, Request, Response } from "express";

import { type Raw, Student } from "../datasource/entity/entities";
import * as Service from "../service/student-service";
import { HttpError, HttpErrorHandler } from "../infra/error/error-classes";

export { getAll, get, post, put, remove };


type ErrorHandled<T> = T | HttpErrorHandler;

type HandledRawList = ErrorHandled<Raw<Student[]>>;
type HandledRaw = ErrorHandled<Raw<Student>>

type GetAllRequest = Request<{}, HandledRawList>;
type GetRequest = Request<{ id: string }, HandledRaw>;
type PostRequest = Request<{}, HandledRaw, unknown>;
type PutRequest = Request<{ id: string }, HandledRaw, unknown>;
type DeleteRequest = Request<{ id: string }, HandledRaw>;

type StudentListResponse = Response<HandledRawList>;
type StudentResponse = Response<HandledRaw>;


function getAll(_req: GetAllRequest, res: StudentListResponse, next: NextFunction) {
	Service.getAll()
		.then(value => res.status(200).json(value))
		.catch(next);
}

function idFromRequestHandler(req: Request<{id:string}>, _res: unknown, next: NextFunction) {
	const id = Number(req.params.id);

	if (isNaN(id)) {
		next(new HttpError(
			400,
			`'id' path parameter must be a number. Received: ${req.params.id}`
		));
		return null;
	}

	return id;
}

function get(req: GetRequest, res: StudentResponse, next: NextFunction) {
	const id = idFromRequestHandler(req, res, next);
	if (id === null) return;

	Service.get(id)
		.then(value => res.status(200).json(value))
		.catch(next);
}

function post(req: PostRequest, res: StudentResponse, next: NextFunction) {
	if (!Student.isValidDTO(req.body))
		return next(new HttpError(400, "Invalid Student DTO format"));

	Service.add(req.body)
		.then(value => res.status(200).json(value))
		.catch(next);
}

function put(req: PutRequest, res: StudentResponse, next: NextFunction) {
	if (!Student.isValidDTO(req.body))
		return next(new HttpError(400, "Invalid Student DTO format"));

	const id = idFromRequestHandler(req, res, next);
	if (id === null) return;

	Service.put(id, req.body)
		.then(value => res.status(200).json(value))
		.catch(next);
}

function remove(req: DeleteRequest, res: StudentResponse, next: NextFunction) {
	const id = idFromRequestHandler(req, res, next);
	if (id === null) return;

	Service.remove(id)
		.then(value => res.status(200).json(value))
		.catch(next);
}
