import { DB_PATH, read, stepID, write, removeFromDB } from "../../utils/files";

export { Raw, DTO, Database, DatabaseCounters, Entity, EntityConstructor, Student, Teacher, Lesson };

type Raw<T> =
    T extends Function ? never :
        T extends Array<infer U> ? Raw<U>[] :
            T extends object ? {
                    [K in keyof T as T[K] extends Function ? never : K]: Raw<T[K]>;
                } :
                T;

type DTO<T> = Omit<Raw<T>, 'id'>;

interface EntityConstructor<T> {
    new(...args: any[]): T;
    fromObjectAsync(obj: DTO<T>): Promise<T>;
    fromObject(id: number, _obj: DTO<T>): T;
    dbKey: keyof DatabaseCounters;
}

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
type Primitive = 'undefined' | 'object' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'function';

function assertPropertyValue(obj: unknown, key: string | number, value: unknown) {
    if (typeof obj !== 'object' || obj === null)
        throw new TypeError("Value is not of type OBJECT or is equal to null");

    if (!(key in obj)) throw new TypeError(
        `Missing property '${key}' of type '${typeof value}' and value '${String(value)}'`
    );

    const valueFromObj = (obj as object & {[key]: unknown})[key];

    if (valueFromObj !== value) throw new TypeError(
        `Expected property '${key}' with type '${typeof value}' and value '${String(value)}'.`
        +` Received with type: '${typeof valueFromObj}' and value '${valueFromObj}'`
    );
}

function assertPropertyType(obj: unknown, key: string | number, typeOrUnion: Primitive[] | Primitive) {
    let typeVisualization: string;
    if (typeof typeOrUnion === 'string') typeVisualization = typeOrUnion;
    else typeVisualization = typeOrUnion.join(' | ');

    if (typeof obj !== 'object' || obj === null)
        throw new TypeError("Value is not of type OBJECT or is equal to null");

    if (!(key in obj)) throw new TypeError(`Missing property '${key}' of type '${typeVisualization}'`);

    const objType = typeof (obj as object & {[key]: unknown})[key];
    
    let hasCorrectType;
    if (typeof typeOrUnion === 'string') hasCorrectType = objType === typeOrUnion;
    else hasCorrectType = typeOrUnion.includes(objType);
    
    if (!hasCorrectType) throw new TypeError(
        `Expected property '${key}' with type '${typeVisualization}'. Received with type: '${objType}'`
    );
}

class Value {
    data: unknown;
    primitiveType: Primitive;
    constructor(data: unknown) {
        this.data = data;
        this.primitiveType = typeof data;
    }
}

/**
 * Asserts `obj` is an object and has properties with types and values according to `schema`.
 *
 * @param obj - Object with propertiees to be asserted.
 * @param schema - Use the schema to dictate how to check for the type of `obj`.
 * <br/> - Put the keys that the object has to check for those keys;
 * <br/> - Put the value as a `Primitive` (string with name of a primitive type) to check for the primitive type;
 * <br/> - Put the value as an instance of Value to compare the exact values of `obj[key]` and `Value.data`.
 */
function assertPropertiesByValueAndPrimitiveType(obj: unknown, schema: {[key: string | number]: Primitive | Value}) {
    for (const key in schema) {
        const value = schema[key];
        if (value instanceof Value)
            assertPropertyValue(obj, key, value);
        else assertPropertyType(obj, key, value);
    }
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
        (db[this.dbKey()] as unknown as typeof this[]).push(this);

        await write(DB_PATH, JSON.stringify(db));
    }

    async removeFromDB() {
        if (this.id !== 0 && !this.id) throw new Error("ID is required to remove the Entity from the Database");
        return removeFromDB(this.id, this.dbKey());
    }

    static async fromObjectAsync(_object: Record<string, unknown>): Promise<Entity> {
        throw new Error("Method not implemented! Use derived class")
    }

    static fromObject(_id: number, _obj: Record<string, unknown>) {
        throw new Error("Method not implemented! Use derived class");
    }

    static assertValidDTO(_obj: unknown) {
        throw new Error("Method not implemented! Use derived class");
    }
}

class Student extends Entity {
    name: string;

    static readonly dbKey = "student";

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    dbKey(): keyof DatabaseCounters {
        return Student.dbKey;
    }

    static async fromObjectAsync(obj: DTO<Student>) {
        return new Student(obj.name).generateID();
    }

    static fromObject(id: number, obj: DTO<Student>) {
        return new Student(obj.name, id);
    }

    static assertValidDTO(obj: unknown): asserts obj is DTO<Student> {
        const schema: {[key: string | number]: Primitive | Value} = {
            name: 'string'
        }
        assertPropertiesByValueAndPrimitiveType(obj, schema);
    }
}

class Teacher extends Entity {
    name: string;

    static readonly dbKey = "teacher";

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    dbKey(): keyof DatabaseCounters {
        return Teacher.dbKey;
    }

    static async fromObjectAsync(obj: DTO<Teacher>) {
        return new Teacher(obj.name).generateID();
    }

    static fromObject(id: number, obj: DTO<Teacher>) {
        return new Teacher(obj.name, id);
    }

    static assertValidDTO(obj: unknown): asserts obj is DTO<Teacher> {
        const schema: {[key: string | number]: Primitive | Value} = {
            name: 'string'
        }
        assertPropertiesByValueAndPrimitiveType(obj, schema);
    }
}

class Lesson extends Entity {
    name: string;

    static readonly dbKey = "lesson";

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    dbKey(): keyof DatabaseCounters {
        return Lesson.dbKey;
    }

    static async fromObjectAsync(obj: DTO<Lesson>) {
        return new Lesson(obj.name).generateID();
    }

    static fromObject(id: number, obj: DTO<Lesson>) {
        return new Lesson(obj.name, id);
    }

    static assertValidDTO(obj: unknown): asserts obj is DTO<Lesson> {
        const schema: {[key: string | number]: Primitive | Value} = {
            name: 'string'
        }
        assertPropertiesByValueAndPrimitiveType(obj, schema);
    }
}