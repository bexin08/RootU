import { z } from "zod";

export const ProgramLevel = z.enum(["undergraduate", "postgraduate", "diploma", "other"]);
export const HousingType = z.enum(["hostel", "pg", "apartment", "other"]);
export const CommuteMode = z.enum(["bus", "auto", "walk", "bike", "own_vehicle"]);
export const KnowledgeCategory = z.enum([
  "transit", "housing", "food", "health_emergency",
  "academic", "community_culture", "finance_essentials",
]);

export const ProfileSchema = z.object({
  full_name: z.string().max(120).nullish().or(z.literal('')),
  origin_city: z.string().max(120).nullish().or(z.literal('')),
  destination_city: z.string().max(120).nullish().or(z.literal('')),
  university: z.string().max(200).nullish().or(z.literal('')),
  major: z.string().max(200).nullish().or(z.literal('')),
  program_level: ProgramLevel.nullish().or(z.literal('')),
  dietary_preferences: z.array(z.string().max(40)).max(10).nullish(),
  move_in_date: z.string().date().nullish().or(z.literal('')),
  housing_type: HousingType.nullish().or(z.literal('')),
});

export const PreferencesSchema = z.object({
  commute_mode: CommuteMode,
  briefing_time: z.string().regex(/^\d{2}:\d{2}$/),
  weather_alert_threshold: z.enum(["low", "medium", "high"]),
  traffic_check_enabled: z.boolean(),
  notify_in_app: z.boolean(),
  notify_email: z.boolean(),
});

export const ScheduleEventSchema = z.object({
  title: z.string().min(1).max(200),
  event_type: z.enum(["class", "lab", "exam", "assignment_due", "other"]),
  location: z.string().max(200).optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  recurrence_rule: z.string().optional(),
}).refine(d => new Date(d.end_time) > new Date(d.start_time), {
  message: "end_time must be after start_time",
});

export const ChatMessageSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  content: z.string().min(1).max(2000),
});

export const OnboardingExtractionSchema = z.object({
  extracted_fields: ProfileSchema.partial(),
  assistant_reply: z.string().min(1),
  onboarding_complete: z.boolean(),
});

export const RagAnswerSchema = z.object({
  answer: z.string().min(1),
  category: KnowledgeCategory.or(z.literal("general")),
  sources: z.array(z.string()),
  context_was_sufficient: z.boolean(),
});

export const DailyBriefingSchema = z.object({
  headline: z.string().min(1),
  content: z.string().min(1),
  weather_alert: z.boolean(),
  traffic_alert: z.boolean(),
  recommended_action: z.string().nullable().optional(),
});
