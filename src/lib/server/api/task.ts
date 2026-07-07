import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '$lib/server/api/types';
import {
  addTask,
  countDueTasks,
  findCompletedTasks,
  findDueTasks,
  findTask,
  findUpcomingTasks,
  markTaskAsDone,
  updateTask
} from '$lib/server/db/functions';
import type { Task } from '$lib/server/db/schema';
import { Assignment, TaskType, Weekday } from '$lib/utils/taskHelper';
import { z } from '$lib/zod';

const taskDoneSchema = z.object({
  taskId: z.string().trim().nonempty(),
  userId: z.string().trim().nonempty()
});

const taskSchema = z.object({
    id: z.string().trim().nullish(),
    name: z.string().trim().nonempty(),
    dueUserId: z.string().trim().pipe(z.transform((val) => (val === '' ? null : val))),
    dueDate: z.string().trim().pipe(z.transform((val) => (val === '' ? null : val))),
    type: z.enum(TaskType),
    weekday: z.union([z.enum(Weekday), z.null()]),
    interval: z.coerce.number().min(1).nullable(),
    assignment: z.union([z.enum(Assignment), z.null()])
  })
    .refine(
      (data) => {
        return data.type === TaskType.Single || !!data.dueDate;
      },
      {
        message: 'schedule_error_repeating_required',
        path: ['dueDate']
      }
    )
    .refine(
      (data) => {
        return data.type === TaskType.Single || !!data.weekday;
      },
      {
        message: 'schedule_error_repeating_required',
        path: ['weekday']
      }
    )
    .refine(
      (data) => {
        return data.type === TaskType.Single || !!data.interval;
      },
      {
        message: 'schedule_error_repeating_required',
        path: ['interval']
      }
    )
    .refine(
      (data) => {
        return data.type === TaskType.Single || !!data.assignment;
      },
      {
        message: 'schedule_error_repeating_required',
        path: ['assignment']
      }
    )
;

const tasksRouter = new Hono<AppEnv>()
  .get('/', async (c) => {
    return c.json({
      dueTasks: await findDueTasks(),
      upcomingTasks: await findUpcomingTasks(),
      completedTasks: await findCompletedTasks()
    });
  })
  .get('/dueTaskCount', async (c) => {
    const loggedInUser = c.get('loggedInUser');

    return c.json(await countDueTasks(loggedInUser.id));
  })
  .post(
    '/done',
    zValidator('json', taskDoneSchema),
    async (c) => {
      const taskCompletion = c.req.valid('json');
      await markTaskAsDone(taskCompletion.taskId, taskCompletion.userId);

      return c.json({ success: true });
    }
  )
  .get('/:task', async (c) => {
    const taskParam = c.req.param('task');
    const task = await findTask(taskParam);
    if (!task) return c.json({ error: 'Task not found' }, 404);

    return c.json(task);
  })
  .post(
    '/',
    zValidator('json', taskSchema),
    async (c) => {
      const task = c.req.valid('json');
      if (!task.id) {
        await addTask(task.type, task.name, task.weekday, task.interval, task.assignment, task.dueUserId, task.dueDate);

        return c.json({ success: true });
      }

      const existingTask = await findTask(task.id) as Task;
      if (existingTask.type !== task.type) {
        const error = new z.ZodError([
          {
            code: 'custom',
            path: ['type'],
            message: 'schedule_error_type_update'
          }
        ]);

        return c.json({ success: false, error }, 400);
      }

      await updateTask(task.id, task.type, task.name, task.weekday, task.interval, task.assignment, task.dueUserId, task.dueDate);

      return c.json({ success: true });
    }
  );

export default tasksRouter;
