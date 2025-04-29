import express from 'express'
import fs from 'fs'

const app = express();
const PORT = 8800;
const DB_PATH = './db.json';
const DB_COUNTERS_PATH = './db-counter.json';
const FILE_ENCODING = 'utf8';

abstract class Entity {
    id?: number;

    abstract get dbKey(): keyof DatabaseCounters;

    protected constructor(id?: number) {
        this.id = id;
    }

    async generateID() {
        this.id = await stepID(this.dbKey);
        return this;
    }
    
    async saveToDB() {
        if (!this.id) throw new Error("ID is required to save the Entity to the Database");
        const db = await read(DB_PATH, JSON.parse) as Database;
        (db[this.dbKey] as unknown  as typeof this[]).push(this);

        await write(DB_PATH, JSON.stringify(db));
    }

    static fromObjectAsync(object: Record<string, any>) {
        throw new Error("Method not implemented! Use derived class")
    }

    static fromObject(id: number, obj: { [key: string]: unknown }) {
        throw new Error("Method not implemented! Use derived class");
    }
}

class Student extends Entity {
    name: string;

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    get dbKey(): keyof DatabaseCounters {
        return "student";
    }

    static async fromObjectAsync(obj: { name: string }) {
        return new Student(obj.name).generateID();
    }

    static fromObject(id: number, obj: { name: string }) {
        return new Student(obj.name, id);
    }
}

class Teacher extends Entity {
    name: string;

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    get dbKey(): keyof DatabaseCounters {
        return "teacher";
    }

    static async fromObjectAsync(obj: { name: string }) {
        return new Teacher(obj.name).generateID();
    }
    
    static fromObject(id: number, obj: { name: string }) {
        return new Teacher(obj.name, id);
    }
}

class Lesson extends Entity {
    name: string;

    constructor(name: string, id?: number) {
        super(id);
        this.name = name;
    }

    get dbKey(): keyof DatabaseCounters {
        return "lesson";
    }

    static async fromObjectAsync(obj: { name: string }) {
        return new Lesson(obj.name).generateID();
    }

    static fromObject(id: number, obj: { name: string }) {
        return new Lesson(obj.name, id);
    }
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

function read<T>(file: fs.PathOrFileDescriptor,
              parser: (data: string) => T): Promise<T> {
    return new Promise((resolve, reject) => {
        fs.readFile(DB_PATH, FILE_ENCODING, (err, data) => {
            if (err) reject(err);
            const parsed = parser(data);
            resolve(parsed);
        });
    });
}

function write(file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView): Promise<null> {
    return new Promise((resolve, reject) => {
        fs.writeFile(DB_PATH, data, FILE_ENCODING, (err) => {
            if (err) reject(err);
            resolve(null);
        });
    });
}

async function currentID(key: keyof DatabaseCounters) {
    const counters = await read(DB_COUNTERS_PATH, JSON.parse) as DatabaseCounters;
    return counters[key];
}

async function stepID(key: keyof DatabaseCounters) {
    const id = await currentID(key);
    const response = await write(DB_COUNTERS_PATH, (id+1).toString());
    return id+1;
}

app.get('/students', (req, res) => {
    const data = read<Database>(DB_PATH, JSON.parse)
        .then(value => res.status(200).json(value.student))
        .catch(e => res.status(400).json(e));
})

app.get('/students/:id',  (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) res.status(404).send('Invalid ID');

    const data = read<Database>(DB_PATH, JSON.parse)
        .then(value => {
            const body = value.student[id];
            if (!body) res.status(404).send('No entity found with specified ID');

            res.status(200).json(body);
        })
        .catch(e => res.status(400).json(e));
})

app.post('/students', async (req, res) => {
    const data = req.body;

    const student = await Student.fromObjectAsync(data);
    
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
