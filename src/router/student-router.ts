import express from "express";
import * as Student from "../controller/student-controller";

export const studentRouter = express.Router();

studentRouter.get('', Student.getAll);
studentRouter.get('/:id', Student.get);
studentRouter.post('', Student.post);
studentRouter.put('/:id', Student.put);
studentRouter.delete('/:id', Student.remove);
