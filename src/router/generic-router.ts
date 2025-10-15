import { Entity } from 'datasource/entity/entities';
import { GenericController } from "controller/generic-controller";
import { Router } from "express";

export class GenericRouter<T extends Entity> {
    public readonly router = Router();

    constructor(protected controller: GenericController<T>) {
        this.setRoutes();
    }

    protected setRoutes() {
        this.router.get('', this.controller.getAll);
        this.router.get('/:id', this.controller.get);
        this.router.post('', this.controller.post);
        this.router.put('/:id', this.controller.put);
        this.router.delete('/:id', this.controller.remove);
    }
}
