import { Task } from "@/src/core/domain/entities/task.entity";
import { CreateTaskDto, UpdateTaskDto } from "@/src/core/application/dto/task.dto";

export interface TaskRepositoryPort {
  create(data: CreateTaskDto): Promise<Task>;
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  update(id: string, data: UpdateTaskDto): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}
