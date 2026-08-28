import { type ActionFailure, fail, type RequestEvent } from '@sveltejs/kit';
import type { z } from 'zod';

interface ProcessFormOptions {
  arrays?: string[];
}

export async function processForm<Schema extends z.ZodType, SuccessReturnType>(
  event: RequestEvent,
  schema: Schema,
  onSuccess: (
    data: z.infer<Schema>,
    event: RequestEvent
  ) => Promise<SuccessReturnType | ActionFailure>,
  options?: ProcessFormOptions
): Promise<SuccessReturnType | ActionFailure<{ issues?: z.core.$ZodIssue[] } | undefined>> {
  const rawFormData = await event.request.formData();

  // Start with standard behavior (strings overwrite arrays)
  const data: Record<string, unknown> = Object.fromEntries(rawFormData);

  // Inject arrays if requested
  if (options?.arrays) {
    for (const key of options.arrays) {
      data[key] = rawFormData.getAll(key);
    }
  }

  const validationResult = schema.safeParse(data);

  if (!validationResult.success) {
    return fail(422, { issues: validationResult.error.issues });
  }

  return onSuccess(validationResult.data, event);
}

export function failForm(path: string, message: string) {
  return fail(422, {
    issues: [
      { path: [path], message }
    ]
  });
}