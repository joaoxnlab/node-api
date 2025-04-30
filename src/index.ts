import express from 'express'
import fs from 'fs'

const app = express();
const PORT = 8800;
const DB_PATH = './db.json';
const DB_COUNTERS_PATH = './db-counter.json';
const FILE_ENCODING = 'utf8';

app.use(express.json());

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

async function removeFromDB(id: number, dbKey: keyof Database) {
    if (id !== 0 && !id) throw new Error("ID is required to save the Entity to the Database");
    const db = await read(DB_PATH, JSON.parse) as Database;

    const list = db[dbKey] as Entity[];
    const index = list.findIndex(value=> value.id === id);
    if (index === -1) throw new Error("No entity found with specified ID");

    const deletedEntity = list[index];
    list.splice(index, 1);
    await write(DB_PATH, JSON.stringify(db));

    return deletedEntity;
}

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
        if (this.id !== 0 && !this.id) throw new Error("ID is required to save the Entity to the Database");
        const db = await read(DB_PATH, JSON.parse) as Database;
        (db[this.dbKey] as unknown  as typeof this[]).push(this);

        await write(DB_PATH, JSON.stringify(db));
    }

    async removeFromDB() {
        if (this.id !== 0 && !this.id) throw new Error("ID is required to remove the Entity from the Database");
        return removeFromDB(this.id, this.dbKey);
    }

    static fromObjectAsync(object: Record<string, unknown>) {
        throw new Error("Method not implemented! Use derived class")
    }

    static fromObject(id: number, obj: Record<string, unknown>) {
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

function read<T>(file: fs.PathOrFileDescriptor,
              parser: (data: string) => T): Promise<T> {
    return new Promise((resolve, reject) => {
        fs.readFile(file, FILE_ENCODING, (err, data) => {
            if (err) reject(err);
            const parsed = parser(data);
            resolve(parsed);
        });
    });
}

function write(file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView): Promise<null> {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, FILE_ENCODING, (err) => {
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
    const counters = await read(DB_COUNTERS_PATH, JSON.parse) as DatabaseCounters;
    const id = counters[key];
    counters[key]++;

    await write(DB_COUNTERS_PATH, JSON.stringify(counters));
    return id;
}

app.get('/students', (req, res) => {
    console.log(`GET /students -> Initializing request`)

    read<Database>(DB_PATH, JSON.parse)
        .then(value => res.status(200).json(value.student))
        .catch(e => res.status(400).json(e));
})

app.get('/students/:id',  (req, res) => {
    console.log(`GET /students/${req.params.id} -> Initializing request`)
    
    const id = Number(req.params.id);
    if (isNaN(id)) res.status(404).send('Invalid ID');

    read<Database>(DB_PATH, JSON.parse)
        .then(value => {
            const index = value.student.findIndex(value => value.id === id);
            if (index === -1) res.status(404).send('No entity found with specified ID');
            const body = value.student[index];

            res.status(200).json(body);
        })
        .catch(e => res.status(400).json(e));
})

app.post('/students', async (req, res) => {
    console.log(`POST /students -> Initializing request`)
    
    const data = req.body;
    if (!data || !("name" in data)) {
        res.status(400).send("Invalid body format");
    }

    try {
        const student = await Student.fromObjectAsync(data);
        await student.saveToDB();

        res.status(201).json(student);
    } catch (e) {
        console.error("POST /students -> Unknown error thrown: "+ e)
        throw e;
    }
})

app.put('/students/:id', async (req, res) => {
    console.log(`PUT /students/${req.params.id} -> Initializing request`)

    const id = Number(req.params.id);
    if (isNaN(id)) res.status(404).send('Invalid ID');


})

app.delete('/students/:id', async (req, res) => {
    console.log(`DELETE /students/${req.params.id} -> Initializing request`)

    const id = Number(req.params.id);
    if (isNaN(id)) res.status(404).send('Invalid ID');

    removeFromDB(id, 'student')
        .then(value => res.status(200).json(value))
        .catch(e => res.status(400).send(e.message));
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
