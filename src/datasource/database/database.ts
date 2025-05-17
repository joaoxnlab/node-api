import sqlite3 from 'sqlite3';
import {Database, open} from 'sqlite';
import * as path from "node:path";
import {read} from "../../utils/files";

let db: Database | undefined = undefined;

export function getDB() {
    if (!db) throw new Error(
        "Database is not open. Please call openDB() before using the database."
    )
    return db;
}

export async function openDB() {
    db = await open({
        filename: path.join(__dirname, 'sqlite.db'),
        driver: sqlite3.Database
    });
    const schema = await read(path.join(__dirname, 'schema.sql'), (data)=>data);
    await db.exec(schema);

    return db;
}

export async function requireDB() {
    if (db) return db;
    return openDB();
}
