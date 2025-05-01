import fs from "fs";
import { Database, DatabaseCounters, Entity } from "../datasource/entity/entities";
import { HttpError } from "../infra/error/error-classes";

export { read, write, currentID, stepID, removeFromDB };

export const DB_PATH = "./datasource/repository/db.json";
export const DB_COUNTER_PATH = "./datasource/repository/db-counter.json";
export const FILE_ENCODING = "utf8";
function read<T>(file: fs.PathOrFileDescriptor,
                 parser: (data: string) => T): Promise<T> {
    return new Promise((resolve, reject) => {
        fs.readFile(file, FILE_ENCODING, (err, data) => {
            if (err) return reject(err);
            const parsed = parser(data);
            return resolve(parsed);
        });
    });
}

function write(file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView): Promise<null> {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, FILE_ENCODING, (err) => {
            if (err) return reject(err);
            return resolve(null);
        });
    });
}

async function currentID(key: keyof DatabaseCounters) {
    const counters = await read(DB_COUNTER_PATH, JSON.parse) as DatabaseCounters;
    return counters[key];
}

async function stepID(key: keyof DatabaseCounters) {
    const counters = await read(DB_COUNTER_PATH, JSON.parse) as DatabaseCounters;
    const id = counters[key];
    counters[key]++;

    await write(DB_COUNTER_PATH, JSON.stringify(counters));
    return id;
}

async function removeFromDB(id: number, dbKey: keyof Database) {
    if (id !== 0 && !id) throw new Error("ID is required to save the Entity to the Database");
    const db = await read(DB_PATH, JSON.parse) as Database;

    const list = db[dbKey] as Entity[];
    const index = list.findIndex(value=> value.id === id);
    if (index === -1)
        throw new HttpError(404, `No entity found with ID '${id}'`);

    const deletedEntity = list[index];
    list.splice(index, 1);
    await write(DB_PATH, JSON.stringify(db));

    return deletedEntity;
}
