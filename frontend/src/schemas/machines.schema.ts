import { z } from "zod";

export const machineSchema = z.object({
  name: z.string().min(1, "Name is required."),
  line: z.string().optional(),
  location: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  photo_url: z.string().optional(),
});

export type MachineFormValues = z.infer<typeof machineSchema>;
