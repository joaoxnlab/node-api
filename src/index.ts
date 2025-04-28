import express from 'express'
import fs from 'fs'

const app = express();
const PORT = 8800;
const DB_PATH = './db.json';
const FILE_ENCODING = 'utf8';

function read(file: fs.PathOrFileDescriptor = DB_PATH) {
    return new Promise((resolve, reject) => {
        fs.readFile(DB_PATH, FILE_ENCODING, (err, data) => {
            if (err) reject(err);
            const object = JSON.parse(data);
            resolve(object);
        });
    });
}

function write(data: string | NodeJS.ArrayBufferView) {
    return new Promise((resolve, reject) => {
        fs.writeFile(DB_PATH, data, FILE_ENCODING, (err) => {
            if (err) reject(err);
            resolve(null);
        });
    });
}

// function getCurrentID() {
//     read()
// }

app.get('/', (req, res) => {})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
