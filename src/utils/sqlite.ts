import * as sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from "node:path";
import * as sqlite from "node:sqlite";


export const DB_PATH = path.join(__dirname, '..', 'datasource', 'repository', 'sqlite.db');

async function connect() {
    const db = await open({
        filename: './teste.db',
        driver: sqlite3.Database
    })

    await db.exec(`CREATE TABLE IF NOT EXISTS student (
    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    name TEXT NOT NULL,
    age INT NOT NULL,
    phone TEXT
         )`);

}


