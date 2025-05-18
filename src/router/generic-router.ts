import { Entity } from 'datasource/entity/entities';
import { GenericController } from 'controller/generic-controller';
import { Router } from 'express';


let router: Router | undefined = undefined;

export function getRouter<T extends Entity>(controller?: GenericController<T>) {
	if (router) return router;
	if (!controller) throw new Error('No controller provided');

	router = Router();
	router.get('', controller.getAll);
	router.get('/:id', controller.get);
	router.post('', controller.post);
	router.put('/:id', controller.put);
	router.delete('/:id', controller.remove);

	return router;
}
