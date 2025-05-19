import { Student } from 'datasource/entity/entities';
import { GenericService } from "./generic-service";
import { GenericRepository } from 'datasource/repository/generic-repository';

export class StudentService extends GenericService<Student> {
    constructor(repository: GenericRepository<Student>) {
        super(Student, repository);
    }

    static async new() {
        return new StudentService(await GenericRepository.new<Student>(Student.tableName));
    }
}
