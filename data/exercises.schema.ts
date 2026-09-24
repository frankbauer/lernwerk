// Schema for data/exercises.json (the metadata behind the Übungsplaner).
// NOTE: Not wired up yet - requires `zod` and a TypeScript build step.
import { z } from "zod";

/** Kind of exercise, as labeled in uebersicht.html. */
export const ExerciseTypeSchema = z.enum([
    "lecture", // Vorlesungsbeispiel: code discussed in the lecture
    "sandbox", // Sandkasten: task students solve during the lecture
    "exercise", // Übung: optional practice (no label in uebersicht.html)
    "test", // Test: mandatory assessment (planned, none yet)
    "tool", // e.g. Taschenrechner, not an exercise
]);

export const ChapterSchema = z.object({
    /** Derived from the folder prefix, e.g. 8 for "08_Klassenmethoden". */
    number: z.number().int().nonnegative(),
    folder: z.string().min(1),
    /** Section heading from uebersicht.html. */
    title: z.string().min(1),
});

/** A Java concept used as a filter tag ("Konzepte die ich bereits kenne"). */
export const ConceptSchema = z.object({
    /** Slug, primarily derived from the chapter folder name. */
    id: z.string().regex(/^[a-z0-9-]+$/),
    label: z.string().min(1),
    /** Chapter that introduces this concept. */
    chapter: z.number().int().nonnegative(),
    /** Optional emoji/icon for the tag pill on the card. */
    icon: z.string().nullable().optional(),
});

export const TypeInfoSchema = z.object({
    id: ExerciseTypeSchema,
    label: z.string().min(1),
});

export const ExerciseSchema = z.object({
    /** Path of the exercise without trailing slash / .html. */
    id: z.string().min(1),
    title: z.string().min(1),
    /** One-sentence teaser shown on the card (German). */
    description: z.string().min(1),
    /** Link relative to the site root, exactly as in uebersicht.html. */
    link: z.string().min(1),
    chapter: z.number().int().nonnegative(),
    type: ExerciseTypeSchema,
    /** Übungslevel, 1 (sehr einfach) to 5 (sehr schwer). */
    difficulty: z.number().int().min(1).max(5),
    /** Concept ids needed to solve the exercise; the chapter's own concept comes first. */
    tags: z.array(z.string()).min(1),
    /** Beispiellösung available (lecture examples show complete code). */
    hasSolution: z.boolean(),
    /** Detailed explanation (Erklärung) available. */
    hasExplanation: z.boolean(),
    /** Additional thinking tasks (Experimente) available. */
    hasExperiments: z.boolean(),
    /** Marked with <new> in uebersicht.html. */
    isNew: z.boolean(),
    /** Card image, relative to the site root. Not provided yet. */
    image: z.string().nullable().optional(),
});

export const ExerciseCatalogSchema = z
    .object({
        version: z.literal(1),
        chapters: z.array(ChapterSchema),
        concepts: z.array(ConceptSchema),
        types: z.array(TypeInfoSchema),
        exercises: z.array(ExerciseSchema),
    })
    .superRefine((catalog, ctx) => {
        const chapters = new Set(catalog.chapters.map((c) => c.number));
        const concepts = new Set(catalog.concepts.map((c) => c.id));
        const ids = new Set<string>();

        catalog.concepts.forEach((concept, i) => {
            if (!chapters.has(concept.chapter)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["concepts", i, "chapter"],
                    message: `Unknown chapter ${concept.chapter}`,
                });
            }
        });

        catalog.exercises.forEach((exercise, i) => {
            if (ids.has(exercise.id)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["exercises", i, "id"],
                    message: `Duplicate exercise id ${exercise.id}`,
                });
            }
            ids.add(exercise.id);

            if (!chapters.has(exercise.chapter)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["exercises", i, "chapter"],
                    message: `Unknown chapter ${exercise.chapter}`,
                });
            }
            exercise.tags.forEach((tag, j) => {
                if (!concepts.has(tag)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["exercises", i, "tags", j],
                        message: `Unknown concept ${tag}`,
                    });
                }
            });
        });
    });

export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type Concept = z.infer<typeof ConceptSchema>;
export type TypeInfo = z.infer<typeof TypeInfoSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseCatalog = z.infer<typeof ExerciseCatalogSchema>;

/** Parses and validates the raw JSON (throws a ZodError on invalid data). */
export function parseExerciseCatalog(json: unknown): ExerciseCatalog {
    return ExerciseCatalogSchema.parse(json);
}
