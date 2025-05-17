import {Database, DTO, Entity, Lesson, Raw, Schema, Student, Teacher} from "../entity/entities";
import {requireDB} from "../database/database";
import {Database as SQLDatabase} from "sqlite";
import {HttpError} from "../../infra/error/error-classes";

const schemas: { [key in keyof Database]: Schema<Entity> } = {
    student: Student.schema,
    teacher: Teacher.schema,
    lesson: Lesson.schema,
}

export type TableName = "student" | "teacher" | "lesson";

export class GenericRepository<T extends Entity> {
    readonly schema: Schema<Entity>;

    constructor(private readonly db: SQLDatabase, private readonly tableName: keyof Database) {
        this.db = db;
        this.schema = schemas[tableName];
    }

    static async new<T extends Entity>(tableName: keyof Database) {
        const db = await requireDB();
        return new GenericRepository<T>(db, tableName);
    }

    async getAll(): Promise<Raw<T>[]> {
        return await this.db.all(`SELECT *
                                  FROM ${this.tableName}`);
    }

    async get(id: number): Promise<Raw<T> | undefined> {
        return await this.db.get(`SELECT *
                                  FROM ${this.tableName}
                                  WHERE id = ?`, [id]);
    }

    async save(entity: DTO<T>): Promise<Raw<T>> {
        const schemaProperties: string[] = [];
        const entityProperties = [];

        for (const property in this.schema) {
            schemaProperties.push(property);
            if (!(property in entity)) throw new Error(`Property '${property}' is missing from entity`);
            entityProperties.push(entity[(property as keyof DTO<T>)]);
        }

        const result = await this.db.run(
            `INSERT INTO ${this.tableName} (${schemaProperties.join(',')})
             VALUES (${schemaProperties.map(() => '?').join(',')})`,
            entityProperties
        )
        if (result.lastID === undefined) throw new Error(
            `Error while saving entity to database. Last ID is undefined`
        )

        return {
            ...entity,
            id: result.lastID
        } as Raw<T>;

    }

    async replace(id: number, entity: DTO<T>): Promise<Raw<T>> {
        try {
            await this.db.run(`UPDATE ${this.tableName} SET ${Object.keys(entity).map(key => `${key} = ?`).join(', ')} WHERE id = ?`,
                Object.values(entity).concat(id));
        } catch (e) {
            if (!(e instanceof Error)) throw new HttpError(500, `Error while replacing entity in database: ${e}`);
            
        }

        return {
            ...entity,
            id: id
        } as Raw<T>;
    }

    async delete(id: number): Promise<void> {
        await this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    }
}

