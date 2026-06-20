import { TaskGroup } from "@/src/core/domain/entities/task-group.entity";
import {
  CreateTaskGroupDto,
  UpdateTaskGroupDto,
} from "@/src/core/application/dto/task-group.dto";

export interface TaskGroupRepositoryPort {
  create(data: CreateTaskGroupDto): Promise<TaskGroup>;
  findAll(): Promise<TaskGroup[]>;
  findById(id: string): Promise<TaskGroup | null>;
  update(id: string, data: UpdateTaskGroupDto): Promise<TaskGroup | null>;
  delete(id: string): Promise<boolean>;
}
