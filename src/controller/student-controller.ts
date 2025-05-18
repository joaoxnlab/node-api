import { GenericController } from 'controller/generic-controller';
import { Student } from 'datasource/entity/entities';
import { StudentService } from 'service/student-service';


export class StudentController extends GenericController<Student> {
	constructor(service: StudentService) {
		super(Student, service);
	}

	static async new() {
		return new StudentController(await StudentService.new());
	}
}