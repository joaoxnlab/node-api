import { EntityConstructor, type DTO, type Entity, Raw } from "datasource/entity/entities";
import { HttpError } from "infra/error/error-classes";
import {GenericRepository} from "datasource/repository/generic-repository";

export class GenericService<T extends Entity> {
	constructor(private EntityConstructor: EntityConstructor<T>, private Repository: GenericRepository<T>) {}

	async getAll(): Promise<Raw<T>[]> {
		return await this.Repository.getAll();
	}

	async get(id: number): Promise<Raw<T>> {
		const entity = await this.Repository.get(id);

		if (!entity)
			throw new HttpError(404, `No Entity found with ID '${id}'`);

		return entity;
	}

	async add(entityDTO: DTO<T>): Promise<Raw<T>> {
		return await this.Repository.save(entityDTO);
	}

	async put(id: number, entityDTO: DTO<T>): Promise<Raw<T>> {
		return await this.Repository.replace(id, entityDTO);
	}

	async remove(id: number) {
		return await this.Repository.delete(id);
	}
}
