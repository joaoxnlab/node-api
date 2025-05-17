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
    fromObject(id: number, _obj: DTO<T>): T;
    assertValidDTO(obj: unknown): asserts obj is T;
    tableName: TableName;
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

type PrimitiveString = 'undefined' | 'object' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'function';
type OptionalSchemaType = PrimitiveString | 'nothing'; // 'nothing' means `key in obj` is false
type Key = string | number;

type EntitySchema = {
    [key: Key]: PrimitiveString | OptionalSchemaType[] | Value
}

type Schema<T extends Object> = {
    [P in keyof DTO<T>]: PrimitiveString | OptionalSchemaType[] | Value
};

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

    const valueFromObj = (obj as {[key: Key]: unknown})[key];

    if (valueFromObj !== value) throw new TypeError(
        `Expected property '${key}' with type '${typeof value}' and value '${value}'.`
        +` Received with type: '${typeof valueFromObj}' and value '${valueFromObj}'`
    );
}

function assertPropertyType(obj: unknown, key: Key, typeOrUnion: PrimitiveString | OptionalSchemaType[]) {
    let typeVisualization: string;
    if (typeof typeOrUnion === 'string') typeVisualization = typeOrUnion;
    else typeVisualization = typeOrUnion.join(' | ');

    if (typeof obj !== 'object' || obj === null)
        throw new TypeError("Value is not of type OBJECT or is equal to null");

    if (!(key in obj)) {
        if (Array.isArray(typeOrUnion) && typeOrUnion.includes('nothing')) return;
        throw new TypeError(`Missing property '${key}' of type '${typeVisualization}'`);
    }

    const objType = typeof (obj as {[key: Key]: unknown})[key];
    
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
 * @param obj - Object with properties to be asserted.
 * @param schema - Use the schema to dictate how to check for the type of {@link obj}.
 * <br/> - Put the keys that the object has to check for those keys;
 * <br/> - Put the value as a {@link PrimitiveString} to check for a primitive type;
 * <br/> - Put the value as an Array of {@link OptionalSchemaType} to check if it has any of the included types ('nothing' means property does not exist);
 * <br/> - Put the value as an instance of Value to compare the exact values of `obj[key]` and `Value.data`.
 */
function assertPropertiesByValueAndPrimitiveType(obj: unknown, schema: EntitySchema) {
    for (const key in schema) {
        const value = schema[key];
        if (value instanceof Value)
            assertPropertyValue(obj, key, value.data);
        else assertPropertyType(obj, key, value);
    }
}

abstract class Entity {
    id?: number;

    protected constructor(id?: number) {
        this.id = id;
    }

    abstract class(): EntityConstructor<Entity>;

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
    phone: string | undefined;

    static readonly tableName = "student";
    static schema: Schema<Student> = {
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

    static fromObject(id: number, obj: DTO<Student>) {
        return new Student(obj.name, obj.age, obj.phone, id);
    }

    static assertValidDTO(obj: unknown): asserts obj is DTO<Student> {
        assertPropertiesByValueAndPrimitiveType(obj, Student.schema);
    }
}


class Teacher extends Entity {
    name: string;

    static readonly tableName = "teacher";
    static schema: Schema<Teacher> = {
        name: 'string'
    }

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    class() {
        return Teacher;
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

    static readonly tableName = "lesson";
    static schema: Schema<Lesson> = {
        name: 'string'
    }

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    class() {
        return Lesson;
    }

    static fromObject(id: number, obj: DTO<Lesson>) {
        return new Lesson(obj.name, id);
    }

    static assertValidDTO(obj: unknown): asserts obj is DTO<Lesson> {
        assertPropertiesByValueAndPrimitiveType(obj, Lesson.schema);
    }
}
