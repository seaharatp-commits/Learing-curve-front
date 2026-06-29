import { LessonContent } from "@/components/partials/Lesson";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonContent lessonId={id} />;
}
