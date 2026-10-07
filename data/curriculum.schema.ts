// Schema for data/curriculum.json: the course built from the exercise modules (modules/<id>/exercises.json,
// see exercises.schema.ts). It defines the chapters, the concepts each chapter introduces and the exercises
// ({module, id}) it contains. catalog.js merges curriculum and modules into one catalog (CatalogSchema).
// NOTE: Not wired up yet - requires `zod` and a TypeScript build step.
import { z } from "zod";
import { ConceptSchema, ExerciseSchema, ExerciseTypeSchema } from "./exercises.schema";

export const TypeInfoSchema = z.object({
    id: ExerciseTypeSchema,
    label: z.string().min(1),
    /** Shorter label for the type badge next to the title (falls back to `label`). */
    short: z.string().min(1).optional(),
    /** Pixel-art icon shown in the type badge and filter, relative to the site root, e.g. "img/types/lecture.png". */
    icon: z.string().nullable().optional(),
});

export const ModuleRefSchema = z.object({
    /** Id of the module (= `id` in its exercises.json). */
    id: z.string().regex(/^[a-z0-9-]+$/),
    /** Folder of the module relative to the site root, e.g. "modules/gdi/". */
    path: z.string().min(1),
});

/** An exercise of a module, e.g. { module: "gdi", id: "05_Objekte/vector" }. */
export const ExerciseRefSchema = z.object({
    module: z.string().regex(/^[a-z0-9-]+$/),
    id: z.string().min(1),
});

export const ChapterSchema = z.object({
    /** Number shown as "Kapitel <n>" and used by data/karte.json. */
    number: z.number().int().nonnegative(),
    title: z.string().min(1),
    /** Concept ids introduced in this chapter (from any module). */
    concepts: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
    /** Exercises of this chapter, in this order; an exercise belongs to the first chapter listing it. */
    exercises: z.array(ExerciseRefSchema),
});

export const CurriculumSchema = z
    .object({
        version: z.literal(1),
        types: z.array(TypeInfoSchema),
        modules: z.array(ModuleRefSchema).min(1),
        chapters: z.array(ChapterSchema),
    })
    .superRefine((curriculum, ctx) => {
        const modules = new Set(curriculum.modules.map((m) => m.id));
        const numbers = new Set<number>();
        const exercises = new Set<string>();
        const concepts = new Set<string>();

        curriculum.chapters.forEach((chapter, i) => {
            if (numbers.has(chapter.number)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["chapters", i, "number"],
                    message: `Duplicate chapter ${chapter.number}`,
                });
            }
            numbers.add(chapter.number);
            chapter.concepts.forEach((concept, j) => {
                if (concepts.has(concept)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["chapters", i, "concepts", j],
                        message: `Concept ${concept} is introduced twice`,
                    });
                }
                concepts.add(concept);
            });
            chapter.exercises.forEach((ref, j) => {
                if (!modules.has(ref.module)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["chapters", i, "exercises", j, "module"],
                        message: `Unknown module ${ref.module}`,
                    });
                }
                const key = `${ref.module}/${ref.id}`;
                if (exercises.has(key)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["chapters", i, "exercises", j],
                        message: `Exercise ${key} is listed twice`,
                    });
                }
                exercises.add(key);
            });
        });
        // Whether the referenced exercises and concepts exist can only be checked against the loaded modules.
    });

/** The merged catalog that catalog.js hands to uebungsplaner.js, karte.js and theme.js. */
export const CatalogSchema = z.object({
    version: z.literal(1),
    chapters: z.array(ChapterSchema.pick({ number: true, title: true })),
    /** Concepts of all modules used in the curriculum; `chapter` = chapter that introduces it (or first uses it). */
    concepts: z.array(ConceptSchema.extend({ chapter: z.number().int().nonnegative() })),
    types: z.array(TypeInfoSchema),
    /** Exercises listed in the curriculum: `id` is "<module>/<id>", `link` and `image` are relative to the site root. */
    exercises: z.array(
        ExerciseSchema.extend({
            module: z.string(),
            chapter: z.number().int().nonnegative(),
        })
    ),
    modules: z.array(ModuleRefSchema.extend({ title: z.string() })),
});

export type TypeInfo = z.infer<typeof TypeInfoSchema>;
export type ModuleRef = z.infer<typeof ModuleRefSchema>;
export type ExerciseRef = z.infer<typeof ExerciseRefSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type Curriculum = z.infer<typeof CurriculumSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;

/** Parses and validates the raw JSON (throws a ZodError on invalid data). */
export function parseCurriculum(json: unknown): Curriculum {
    return CurriculumSchema.parse(json);
}
