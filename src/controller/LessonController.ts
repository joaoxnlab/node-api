import { type Body, GenericController } from 'controller/generic-controller';
import { type DTO, Lesson } from 'datasource/entity/entities';
import { HttpError, InvalidFormatError } from 'infra/error/error-classes';
import type { GenericService } from 'service/generic-service';


export class LessonController extends GenericController<Lesson> {
	constructor(service: GenericService<Lesson>) {
		super(Lesson, service);
	}

	assertValidDTO: (body: Body) => asserts body is DTO<Lesson> = async (body: Body) => {
		try {
			this.EntityConstructor.assertValidDTO(body);
			await this.EntityConstructor.assertValidDTOAsync?.(body);
		} catch (err: unknown) {
			if (err instanceof InvalidFormatError)
				throw new HttpError(400,
					`Invalid '${this.EntityConstructor.tableName}' DTO format: ${err.message}`, err);
			throw err;
		}
	}
}