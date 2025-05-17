import express, {Router} from "express";
import { StudentController } from "../controller/student-controller";
import {StudentService} from "../service/student-service";

let router: Router | undefined = undefined;
let controller: StudentController | undefined = undefined;


export function getRouter() {
    return router;
}

export async function requireRouter() {
    if (router && controller) return router;

    router = express.Router();
    controller = new StudentController(await StudentService.new());

    router.get('', controller.getAll);
    router.get('/:id', controller.get);
    router.post('', controller.post);
    router.put('/:id', controller.put);
    router.delete('/:id', controller.remove);

    return router;
}
