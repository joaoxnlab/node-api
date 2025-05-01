import { DB_PATH, read, stepID, write, removeFromDB } from "../../file-utils";

export { Raw, DTO, Database, DatabaseCounters, Entity, Student, Teacher, Lesson };

type Raw<T> =
    T extends Function ? never :
        T extends Array<infer U> ? Raw<U>[] :
            T extends object ? {
                    [K in keyof T as T[K] extends Function ? never : K]: Raw<T[K]>;
                } :
                T;

type DTO<T> = Omit<Raw<T>, 'id'>;

type Database = {
    student: Student[],
    teacher: Teacher[],
    lesson: Lesson[]
}

type DatabaseCounters<T = number> = {
    student: T,
    teacher: T,
    lesson: T
}

abstract class Entity {
    id?: number;

    abstract dbKey(): keyof DatabaseCounters;

    protected constructor(id?: number) {
        this.id = id;
    }

    async generateID() {
        this.id = await stepID(this.dbKey());
        return this;
    }

    async saveToDB() {
        if (this.id !== 0 && !this.id) throw new Error("ID is required to save the Entity to the Database");
        const db = await read(DB_PATH, JSON.parse) as Database;
        (db[this.dbKey()] as unknown  as typeof this[]).push(this);

        await write(DB_PATH, JSON.stringify(db));
    }

    async removeFromDB() {
        if (this.id !== 0 && !this.id) throw new Error("ID is required to remove the Entity from the Database");
        return removeFromDB(this.id, this.dbKey());
    }

    static fromObjectAsync(_object: Record<string, unknown>) {
        throw new Error("Method not implemented! Use derived class")
    }

    static fromObject(_id: number, _obj: Record<string, unknown>) {
        throw new Error("Method not implemented! Use derived class");
    }

    //? TODO: Implement with creating errors and asserting or as-is?
    static isValidDTO(_obj: unknown) {
        throw new Error("Method not implemented! Use derived class");
    }
}

class Student extends Entity {
    name: string;

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    dbKey(): keyof DatabaseCounters {
        return "student";
    }

    static async fromObjectAsync(obj: { name: string }) {
        return new Student(obj.name).generateID();
    }

    static fromObject(id: number, obj: { name: string }) {
        return new Student(obj.name, id);
    }

    static isValidDTO(obj: unknown): obj is DTO<Student> {
        return typeof obj === "object" && obj !== null
            && "name" in obj && typeof obj.name === "string";
    }
}

class Teacher extends Entity {
    name: string;

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    dbKey(): keyof DatabaseCounters {
        return "teacher";
    }

    static async fromObjectAsync(obj: { name: string }) {
        return new Teacher(obj.name).generateID();
    }

    static fromObject(id: number, obj: { name: string }) {
        return new Teacher(obj.name, id);
    }

    static isValidDTO(obj: unknown): obj is DTO<Student> {
        return typeof obj === "object" && obj !== null
            && "name" in obj && typeof obj.name === "string";
    }
}

class Lesson extends Entity {
    name: string;

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    dbKey(): keyof DatabaseCounters {
        return "lesson";
    }

    static async fromObjectAsync(obj: { name: string }) {
        return new Lesson(obj.name).generateID();
    }

    static fromObject(id: number, obj: { name: string }) {
        return new Lesson(obj.name, id);
    }

    static isValidDTO(obj: unknown): obj is DTO<Student> {
        return typeof obj === "object" && obj !== null
            && "name" in obj && typeof obj.name === "string";
    }
}