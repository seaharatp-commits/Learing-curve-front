import { QuizTakeContent } from "@/components/partials/QuizTake";

export default async function QuizTakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizTakeContent quizId={id} />;
}
