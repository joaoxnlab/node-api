import type {Request, Response} from "express";
import type { GenericService } from 'service/generic-service';

import { type DTO, Entity, type EntityConstructor, type Raw } from 'datasource/entity/entities';
import { HttpError, HttpErrorHandler, InvalidFormatError } from 'infra/error/error-classes';


type ErrorHandled<T> = T | HttpErrorHandler;

type HandledRawList<T> = ErrorHandled<Raw<T>[]>;
type HandledRaw<T> = ErrorHandled<Raw<T>>

type GetAllRequest<T> = Request<{}, HandledRawList<T>>;

type GetRequest<T> = Request<{ id: string }, HandledRaw<T>>;
type PostRequest<T> = Request<{}, HandledRaw<T>, Body>;
type PutRequest<T> = Request<{ id: string }, HandledRaw<T>, Body>;
type DeleteRequest<T> = Request<{ id: string }, HandledRaw<T>>;
type ControllerListResponse<T> = Response<HandledRawList<T>>;

type ControllerResponse<T> = Response<HandledRaw<T>>;

export type Body = Record<string, unknown> | undefined;


export class GenericController<T extends Entity> {
    constructor(protected EntityConstructor: EntityConstructor<T>, protected service: GenericService<T>) {}

    idFromPathParams = (req: Request<{ id: string }>, _res: unknown) => {
        const id = Number(req.params.id);

        if (isNaN(id)) throw new HttpError(
            400,
            `'id' path parameter must be a number. Received: ${req.params.id}`
        );

        return id;
    }

    assertValidDTO: (body: Body) => asserts body is DTO<T> = (body: Body) => {
        try {
            this.EntityConstructor.assertValidDTO(body);
        } catch (err: unknown) {
            if (err instanceof InvalidFormatError)
                throw new HttpError(400,
                    `Invalid '${this.EntityConstructor.tableName}' DTO format: ${err.message}`, err);
            throw err;
        }
    }

    getAll = async (_req: GetAllRequest<T>, res: ControllerListResponse<T>) => {
        const entities = await this.service.getAll();
        res.status(200).json(entities);
    }

    get = async (req: GetRequest<T>, res: ControllerResponse<T>) => {
        const id = this.idFromPathParams(req, res);
        res.status(200).json(await this.service.get(id));
    }

    post = async (req: PostRequest<T>, res: ControllerResponse<T>) => {
        this.assertValidDTO(req.body);

        const newEntity = await this.service.add(req.body);
        res.status(201).json(newEntity);
    }

    put = async (req: PutRequest<T>, res: ControllerResponse<T>) => {
        const id = this.idFromPathParams(req, res);
        this.assertValidDTO(req.body);

        const entity = await this.service.put(id, req.body);
        res.status(200).json(entity);
    }

    remove = async (req: DeleteRequest<T>, res: ControllerResponse<T>) => {
        const id = this.idFromPathParams(req, res);
        await this.service.remove(id);
        res.status(204).send();
    }
}
