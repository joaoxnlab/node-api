import type {Request, Response} from "express";

import {type DTO, type Raw, Student} from "../datasource/entity/entities";
import {HttpError, HttpErrorHandler} from "../infra/error/error-classes";
import {StudentService} from "../service/student-service";


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


export class StudentController {
    constructor(private service: StudentService) {}

    idFromPathParams = (req: Request<{ id: string }>, _res: unknown) => {
        const id = Number(req.params.id);

        if (isNaN(id)) throw new HttpError(
            400,
            `'id' path parameter must be a number. Received: ${req.params.id}`
        );

        return id;
    }

    assertValidDTO: (body: Body) => asserts body is DTO<Student> = (body: Body) => {
        try {
            Student.assertValidDTO(body);
        } catch (err: unknown) {
            if (err instanceof TypeError)
                throw new HttpError(400, `Invalid Student DTO format: ${err.message}`, err);
            throw err;
        }
    }

    getAll = async (_req: GetAllRequest, res: StudentListResponse) => {
        const students = await this.service.getAll();
        res.status(200).json(students);
    }

    get = async (req: GetRequest, res: StudentResponse) => {
        const id = this.idFromPathParams(req, res);
        res.status(200).json(await this.service.get(id));
    }

    post = async (req: PostRequest, res: StudentResponse) => {
        this.assertValidDTO(req.body);

        const newStudent = await this.service.add(req.body);
        res.status(201).json(newStudent);
    }

    put = async (req: PutRequest, res: StudentResponse) => {
        const id = this.idFromPathParams(req, res);
        this.assertValidDTO(req.body);

        const student = await this.service.put(id, req.body);
        res.status(200).json(student);
    }

    remove = async (req: DeleteRequest, res: StudentResponse) => {
        const id = this.idFromPathParams(req, res);
        await this.service.remove(id);
        res.status(204).send();
    }
}
