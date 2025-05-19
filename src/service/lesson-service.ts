import { Lesson } from 'datasource/entity/entities';
import { GenericRepository } from 'datasource/repository/generic-repository';
import { GenericService } from 'service/generic-service';


export class LessonService extends GenericService<Lesson> {
	constructor(repository: GenericRepository<Lesson>) {
		super(Lesson, repository);
	}

	static async new() {
		return new LessonService(await GenericRepository.new<Lesson>(Lesson.tableName));
	}
}