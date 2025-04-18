import { z } from "zod";

// Define schema for modifiers
const ModifiersSchema = z.object({
  isControl: z.boolean().default(false),
  isShift: z.boolean().default(false),
  isAlt: z.boolean().default(false),
  isMeta: z.boolean().default(false),
});

// Define schema for a single shortcut
export const ShortcutSchema = z.object({
  isModifiers: ModifiersSchema,
  key: z.string().min(1, "Key is required"),
  uniqueIdentifier: z.string().min(1, "Unique identifier is required"),
  isRelativeToScrollItem: z.boolean().default(false),
});

// Define schema for the entire WebSubURLShortcut
export const WebSubURLShortcutSchema = z.object({
  uuid: z.string().uuid("Invalid UUID format").optional(),
  hrefRegex: z.string().min(1, "URL regex pattern is required"),
  shortcuts: z.array(ShortcutSchema).min(1, "At least one shortcut is required"),
  scrollBoxIdentifier: z.string(),
});

// Define schema for Redis connection
export const RedisConnectionSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.string().transform(val => parseInt(val, 10)),
  password: z.string().optional(),
  username: z.string().optional(),
});

// Type inference
export type ModifiersSchemaType = z.infer<typeof ModifiersSchema>;
export type ShortcutSchemaType = z.infer<typeof ShortcutSchema>;
export type WebSubURLShortcutSchemaType = z.infer<typeof WebSubURLShortcutSchema>;
export type RedisConnectionSchemaType = z.infer<typeof RedisConnectionSchema>;