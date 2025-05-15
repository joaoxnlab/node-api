import {DB_PATH, read, removeFromDB} from "../utils/files";
import { Database, EntityConstructor, type DTO, type Entity, Raw } from "../datasource/entity/entities";
import { HttpError } from "../infra/error/error-classes";

export class GenericService<T extends Entity> {
	constructor(private EntityConstructor: EntityConstructor<T>) {}

	async getAll(): Promise<Raw<T>[]> {
		const rawDB: Raw<Database> = await read<Raw<Database>>(DB_PATH, JSON.parse);
		return rawDB[this.EntityConstructor.dbKey] as unknown as Raw<T>[];
	}

	async get(id: number): Promise<Raw<T>> {
		const entities = await this.getAll();

		const index = entities.findIndex((entity) => entity.id === id);
		if (index === -1)
			throw new HttpError(404, `No Entity found with ID '${id}'`);

		return entities[index];
	}

	async add(entityDTO: DTO<T>): Promise<T> {
		const entity = await this.EntityConstructor.fromObjectAsync(entityDTO);
		await entity.saveToDB();
		return entity;
	}

	async put(id: number, entityDTO: DTO<T>): Promise<T> {
		await removeFromDB(id, this.EntityConstructor.dbKey);
		const entity = this.EntityConstructor.fromObject(id, entityDTO);
		await entity.saveToDB();
		return entity;
	}

	async remove(id: number): Promise<T> {
		const entity = this.EntityConstructor.fromObject(id, await this.get(id));
		await entity.removeFromDB();
		return entity;
	}
}
