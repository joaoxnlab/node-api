// import {DB_PATH, read, removeFromDB} from "../utils/files";
// import { HttpError } from "../infra/error/error-classes";
// import { Database, type DTO, Raw } from "../datasource/entity/entities";
import { Student } from "../datasource/entity/entities";
import { GenericService } from "./generic-service";

export class StudentService extends GenericService<Student> {
    constructor() {
        super(Student);
    }
}

// ! The below code is not in usage!
// ? Being substituted by GenericService until further changes
// TODO: Delete below code once Generics are properly structured

// export { getAll, get, add, put, remove };

// async function getAll(): Promise<Raw<Student>[]> {
//     const rawDB: Raw<Database> = await read<Raw<Database>>(DB_PATH, JSON.parse);
//     return rawDB.student;
// }
//
// async function get(id: number): Promise<Raw<Student>> {
//     const students = await getAll();
//
//     const index = students.findIndex((student) => student.id === id);
//     if (index === -1)
//         throw new HttpError(404, `No Student found with ID '${id}'`);
//
//     return students[index];
// }
//
// async function add(studentDTO: DTO<Student>): Promise<Student> {
//     const student = await Student.fromObjectAsync(studentDTO);
//     await student.saveToDB();
//     return student;
// }
//
// async function put(id: number, studentDTO: DTO<Student>): Promise<Student> {
//     await removeFromDB(id, 'student');
//     const student = Student.fromObject(id, studentDTO);
//     await student.saveToDB();
//     return student;
// }
//
// async function remove(id: number): Promise<Student> {
//     const student = Student.fromObject(id, await get(id));
//     await student.removeFromDB();
//     return student;
// }
