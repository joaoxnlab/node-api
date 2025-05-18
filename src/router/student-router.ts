import { StudentController } from 'controller/student-controller';
import type { Student } from 'datasource/entity/entities';
import { GenericRouter } from 'router/generic-router';


export class StudentRouter extends GenericRouter<Student> {
	static async new() {
		return new StudentRouter(await StudentController.new());
	}
}