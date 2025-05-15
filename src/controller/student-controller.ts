import type { Request, Response } from "express";

import { type DTO, type Raw, Student } from "../datasource/entity/entities";
import { HttpError, HttpErrorHandler } from "../infra/error/error-classes";
import { StudentService } from "../service/student-service";

export { getAll, get, post, put, remove };


type ErrorHandled<T> = T | HttpErrorHandler;

type HandledRawList = ErrorHandled<Raw<Student[]>>;
type HandledRaw = ErrorHandled<Raw<Student>>

type Body = Record<string, unknown> | undefined;

type GetAllRequest = Request<{}, HandledRawList>;
type GetRequest = Request<{ id: string }, HandledRaw>;
type PostRequest = Request<{}, HandledRaw, Body>;
type PutRequest = Request<{ id: string }, HandledRaw, Body>;
type DeleteRequest = Request<{ id: string }, HandledRaw>;

type StudentListResponse = Response<HandledRawList>;
type StudentResponse = Response<HandledRaw>;


const service = new StudentService();

function idFromPathParams(req: Request<{ id: string }>, _res: unknown) {
	const id = Number(req.params.id);

	if (isNaN(id)) throw new HttpError(
		400,
		`'id' path parameter must be a number. Received: ${req.params.id}`
	);

	return id;
}

function assertValidDTO(body: Body): asserts body is DTO<Student> {
	try {
		Student.assertValidDTO(body);
	} catch (err: unknown) {
		if (err instanceof TypeError)
			throw new HttpError(400, `Invalid Student DTO format: ${err.message}`, err);
		throw err;
	}
}

async function getAll(_req: GetAllRequest, res: StudentListResponse) {
	const students = await service.getAll();
	res.status(200).json(students);
}

async function get(req: GetRequest, res: StudentResponse) {
	const id = idFromPathParams(req, res);
	res.status(200).json(await service.get(id));
}

async function post(req: PostRequest, res: StudentResponse) {
	assertValidDTO(req.body);

	const newStudent = await service.add(req.body);
	res.status(201).json(newStudent);
}

async function put(req: PutRequest, res: StudentResponse) {
	const id = idFromPathParams(req, res);
	assertValidDTO(req.body);

	const student = await service.put(id, req.body);
	res.status(200).json(student);
}

async function remove(req: DeleteRequest, res: StudentResponse) {
	const id = idFromPathParams(req, res);
	const student = await service.remove(id);
	res.status(200).json(student);
}
