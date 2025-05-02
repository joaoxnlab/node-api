import {DB_PATH, read, removeFromDB} from "../utils/files";
import {Database, Raw, Student} from "../datasource/entity/entities";
import { HttpError } from "../infra/error/error-classes";

// export { getAll, get, add, put, remove };

// ! This file is not in usage!
// ? Being substituted by GenericService until further changes
// TODO: Extend GenericService or delete the file

async function getAll(): Promise<Raw<Student>[]> {
    const rawDB: Raw<Database> = await read<Raw<Database>>(DB_PATH, JSON.parse);
    return rawDB.student;
}

async function get(id: number): Promise<Raw<Student>> {
    const students = await getAll();

    const index = students.findIndex((student) => student.id === id);
    if (index === -1)
        throw new HttpError(404, `No Student found with ID '${id}'`);

    return students[index];
}

async function add(rawStudent: Omit<Raw<Student>, 'id'>): Promise<Student> {
    const student = await Student.fromObjectAsync(rawStudent);
    await student.saveToDB();
    return student;
}

async function put(id: number, rawStudent: Omit<Raw<Student>, 'id'>): Promise<Student> {
    await removeFromDB(id, 'student');
    const student = Student.fromObject(id, rawStudent);
    await student.saveToDB();
    return student;
}

async function remove(id: number): Promise<Raw<Student>> {
    const student = Student.fromObject(id, await get(id));
    await student.removeFromDB();
    return student;
}
