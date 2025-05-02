import {DB_PATH, read, removeFromDB} from "../utils/files";
import { Database, type DatabaseCounters, type DTO, type Entity, Raw } from "../datasource/entity/entities";
import { HttpError } from "../infra/error/error-classes";


interface EntityConstructor<T> {
	new(...args: any[]): T;
	fromObjectAsync(obj: DTO<T>): Promise<T>;
	fromObject(id: number, _obj: DTO<T>): T;
	dbKey: keyof DatabaseCounters;
}

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

	async add(rawEntity: Omit<Raw<T>, 'id'>): Promise<T> {
		const entity = await this.EntityConstructor.fromObjectAsync(rawEntity);
		await entity.saveToDB();
		return entity;
	}

	async put(id: number, rawEntity: Omit<Raw<T>, 'id'>): Promise<T> {
		await removeFromDB(id, this.EntityConstructor.dbKey);
		const entity = this.EntityConstructor.fromObject(id, rawEntity);
		await entity.saveToDB();
		return entity;
	}

	async remove(id: number): Promise<T> {
		const entity = this.EntityConstructor.fromObject(id, await this.get(id));
		await entity.removeFromDB();
		return entity;
	}
}
