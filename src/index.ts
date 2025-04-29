import express from 'express'
import fs from 'fs'

const app = express();
const PORT = 8800;
const DB_PATH = './db.json';
const DB_COUNTERS_PATH = './db-counters.json';
const FILE_ENCODING = 'utf8';

type Database = {
    students: [],
    teachers: []
}

type DatabaseCounters = {
    students: number,
    teachers: number
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
        .then(value => res.status(200).json(value.students))
        .catch(e => res.status(400).json(e));
})

app.get('/students/:id',  (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) res.status(404).send('Invalid ID');

    const data = read<Database>(DB_PATH, JSON.parse)
        .then(value => {
            const body = value.students[id];
            if (!body) res.status(404).send('No entity found with specified ID');

            res.status(200).json(body);
        })
        .catch(e => res.status(400).json(e));
})

app.post('/students', (req, res) => {
    const data = req.body;

})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
