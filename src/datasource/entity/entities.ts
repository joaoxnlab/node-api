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
type Key = string | number;

type EntitySchema = {
    [key: Key]: Primitive | Primitive[] | Value
}

type Schema<T extends Object> = Map<keyof DTO<T>, Primitive | Primitive[] | Value>;

class Value {
    data: unknown;
    constructor(data: unknown) {
        this.data = data;
    }
}

function assertPropertyValue(obj: unknown, key: Key, value: unknown) {
    if (typeof value === 'object')
        throw new Error("Value cannot be of type OBJECT because object comparisons is always false.");

    if (typeof obj !== 'object' || obj === null)
        throw new TypeError("Value is not of type OBJECT or is equal to null");

    if (!(key in obj)) throw new TypeError(
        `Missing property '${key}' of type '${typeof value}' and value '${value}'`
    );

    const valueFromObj = (obj as object & {[key: Key]: unknown})[key];

    if (valueFromObj !== value) throw new TypeError(
        `Expected property '${key}' with type '${typeof value}' and value '${value}'.`
        +` Received with type: '${typeof valueFromObj}' and value '${valueFromObj}'`
    );
}

function assertPropertyType(obj: unknown, key: Key, typeOrUnion: Primitive | Primitive[], requireKeyWhenUndefined = false) {
    let typeVisualization: string;
    if (typeof typeOrUnion === 'string') typeVisualization = typeOrUnion;
    else typeVisualization = typeOrUnion.join(' | ');

    if (typeof obj !== 'object' || obj === null)
        throw new TypeError("Value is not of type OBJECT or is equal to null");

    if (!(key in obj)) {
        if (!requireKeyWhenUndefined && (
            typeOrUnion === 'undefined' ||
            Array.isArray(typeOrUnion) && typeOrUnion.includes('undefined')
        )) return;

        throw new TypeError(`Missing property '${key}' of type '${typeVisualization}'`);
    }

    const objType = typeof (obj as object & {[key: Key]: unknown})[key];
    
    let hasCorrectType;
    if (typeof typeOrUnion === 'string') hasCorrectType = objType === typeOrUnion;
    else hasCorrectType = typeOrUnion.includes(objType);
    
    if (!hasCorrectType) throw new TypeError(
        `Expected property '${key}' with type '${typeVisualization}'. Received with type: '${objType}'`
    );
}

/**
 * Asserts `obj` is an object and has properties with types and values according to `schema`.
 *
 * @param obj - Object with propertiees to be asserted.
 * @param schema - Use the schema to dictate how to check for the type of `obj`.
 * <br/> - Put the keys that the object has to check for those keys;
 * <br/> - Put the value as a `Primitive` (string with name of a primitive type) to check for the primitive type;
 * <br/> - Put the value as an instance of Value to compare the exact values of `obj[key]` and `Value.data`.
 * @param requireKeyWhenUndefined - Tells if function should throw an error when `key in obj` is false.
 */
function assertPropertiesByValueAndPrimitiveType(obj: unknown, schema: EntitySchema, requireKeyWhenUndefined = false) {
    for (const key in schema) {
        const value = schema[key];
        if (value instanceof Value)
            assertPropertyValue(obj, key, value.data);
        else assertPropertyType(obj, key, value, requireKeyWhenUndefined);
    }
}

abstract class Entity {
    id?: number;

    protected constructor(id?: number) {
        this.id = id;
    }

    abstract class(): EntityConstructor<Entity>;

    async generateID() {
        this.id = await stepID(this.class().dbKey);
        return this;
    }

    async saveToDB() {
        if (this.id !== 0 && !this.id) throw new Error("ID is required to save the Entity to the Database");
        const db = await read(DB_PATH, JSON.parse) as Database;
        (db[this.class().dbKey] as unknown as typeof this[]).push(this);

        await write(DB_PATH, JSON.stringify(db));
    }

    async removeFromDB() {
        if (this.id !== 0 && !this.id) throw new Error("ID is required to remove the Entity from the Database");
        return removeFromDB(this.id, this.class().dbKey);
    }

    static fromObjectAsync(_object: Record<string, unknown>) {
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
    age: number;
    phone?: string;

    static readonly dbKey = "student";
    static schema: EntitySchema = {
        name: 'string',
        age: 'number',
        phone: ['string', 'undefined']
    }

    constructor(name: string, age: number, phone?: string, id?: number) {
        super(id);
        this.name = name;
        this.age = age;
        this.phone = phone;
    }

    class() {
        return Student;
    }

    static async fromObjectAsync(obj: DTO<Student>) {
        return new Student(obj.name, obj.age, obj.phone).generateID();
    }

    static fromObject(id: number, obj: DTO<Student>) {
        return new Student(obj.name, obj.age, obj.phone, id);
    }

    static assertValidDTO(obj: unknown): asserts obj is DTO<Student> {
        assertPropertiesByValueAndPrimitiveType(obj, Student.schema);
    }
}


class Teacher extends Entity {
    name: string;

    static readonly dbKey = "teacher";
    static schema: EntitySchema = {
        name: 'string'
    }

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    class() {
        return Teacher;
    }

    static async fromObjectAsync(obj: DTO<Teacher>) {
        return new Teacher(obj.name).generateID();
    }

    static fromObject(id: number, obj: DTO<Teacher>) {
        return new Teacher(obj.name, id);
    }

    static assertValidDTO(obj: unknown): asserts obj is DTO<Teacher> {
        assertPropertiesByValueAndPrimitiveType(obj, Teacher.schema);
    }
}

class Lesson extends Entity {
    name: string;

    static readonly dbKey = "lesson";
    static schema: EntitySchema = {
        name: 'string'
    }

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    class() {
        return Lesson;
    }

    static async fromObjectAsync(obj: DTO<Lesson>) {
        return new Lesson(obj.name).generateID();
    }

    static fromObject(id: number, obj: DTO<Lesson>) {
        return new Lesson(obj.name, id);
    }

    static assertValidDTO(obj: unknown): asserts obj is DTO<Lesson> {
        assertPropertiesByValueAndPrimitiveType(obj, Lesson.schema);
    }
}
