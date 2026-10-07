// Schema for modules/<id>/exercises.json: the exercises of one module and the concepts they use.
// A module knows nothing about chapters; data/curriculum.json (see curriculum.schema.ts) assigns
// concepts and exercises to the chapters of the course.
// NOTE: Not wired up yet - requires `zod` and a TypeScript build step.
import { z } from "zod";

/** Kind of exercise, as labeled in uebersicht.html (labels and icons: data/curriculum.json). */
export const ExerciseTypeSchema = z.enum([
    "lecture", // Vorlesungsbeispiel: code discussed in the lecture
    "sandbox", // Sandkasten: task students solve during the lecture
    "exercise", // Übung: optional practice (no label in uebersicht.html)
    "test", // Test: mandatory assessment (planned, none yet)
    "tool", // e.g. Taschenrechner, not an exercise
]);

/** A Java concept used as a filter tag ("Konzepte die ich bereits kenne"). */
export const ConceptSchema = z.object({
    /** Slug; modules share concept ids (the first module listed in the curriculum wins). */
    id: z.string().regex(/^[a-z0-9-]+$/),
    label: z.string().min(1),
    /** Optional icon for the concept pill, relative to the module, e.g. "img/concepts/schleifen.png" (see tools/concept_icons.py). */
    icon: z.string().nullable().optional(),
});

export const ExerciseSchema = z.object({
    /** Path of the exercise folder in the module, without trailing slash, e.g. "05_Objekte/vector". */
    id: z.string().min(1),
    title: z.string().min(1),
    /** One-sentence teaser shown on the card (German). */
    description: z.string().min(1),
    /** Link to the exercise page, relative to the module. */
    link: z.string().min(1),
    type: ExerciseTypeSchema,
    /** Übungslevel, 1 (sehr einfach) to 5 (sehr schwer); 0 = not rated yet. */
    difficulty: z.number().int().min(0).max(5),
    /** Concept ids needed to solve the exercise; the main concept comes first. */
    tags: z.array(z.string()).min(1),
    /** Beispiellösung available (lecture examples show complete code). */
    hasSolution: z.boolean(),
    /** Detailed explanation (Erklärung) available. */
    hasExplanation: z.boolean(),
    /** Additional thinking tasks (Experimente) available. */
    hasExperiments: z.boolean(),
    /** Marked as new in the Übungsplaner. */
    isNew: z.boolean(),
    /** Work in progress: only listed in the Übungsplaner with ?showHidden in the URL. */
    isHidden: z.boolean().optional(),
    /** Not finished yet: only listed in the Übungsplaner with ?showDrafts in the URL. */
    isDraft: z.boolean().optional(),
    /** Preview image, relative to the module (see tools/capture_previews.mjs). */
    image: z.string().nullable().optional(),
    /**
     * Crop position of the image in the 2:3 preview boxes, as a CSS object-position
     * (e.g. "left center", "65% center"). Defaults to a centre crop.
     */
    imagePosition: z.string().regex(/^[a-z0-9.% -]+$/i).optional(),
});

export const ExerciseModuleSchema = z
    .object({
        version: z.literal(1),
        /** Module id, also its folder name in modules/ and the prefix of its exercise ids in the merged catalog. */
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        concepts: z.array(ConceptSchema),
        exercises: z.array(ExerciseSchema),
    })
    .superRefine((module, ctx) => {
        const concepts = new Set(module.concepts.map((c) => c.id));
        const ids = new Set<string>();
        module.exercises.forEach((exercise, i) => {
            if (ids.has(exercise.id)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["exercises", i, "id"],
                    message: `Duplicate exercise id ${exercise.id}`,
                });
            }
            ids.add(exercise.id);
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
export type Concept = z.infer<typeof ConceptSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseModule = z.infer<typeof ExerciseModuleSchema>;

/** Parses and validates the raw JSON (throws a ZodError on invalid data). */
export function parseExerciseModule(json: unknown): ExerciseModule {
    return ExerciseModuleSchema.parse(json);
}
