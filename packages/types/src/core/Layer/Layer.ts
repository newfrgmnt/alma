import { z } from 'zod';

import { ContextSchema } from '../Context/Context';
import { FragmentSchema } from '../Fragment/Fragment';

export const BlendingModeSchema = z.enum(['NONE', 'NORMAL', 'ADDITIVE', 'SUBTRACTIVE', 'MUTLIPLY']);

export const LayerSchema = z.object({
    id: z.string(),
    name: z.string(),
    context: ContextSchema,
    enabled: z.boolean(),
    blendingMode: BlendingModeSchema
});

export const FragmentLayerSchema = LayerSchema.extend({
    context: FragmentSchema
});