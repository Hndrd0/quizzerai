"use client";

import { QuizQuestion } from "./QuizGenerator";

type QuizResultsProps = {
  questions: QuizQuestion[];
  answers: Record<number, string>;
  onRestart: () => void;
};

export default function QuizResults({
  questions,
  answers,
  onRestart,
}: QuizResultsProps) {
  const correctCount = questions.filter(
    (question, index) => answers[index] === question.correctAnswer,
  ).length;
  const score = Math.round((correctCount / questions.length) * 100);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Results</h3>
          <p className="text-sm text-slate-300">
            You scored {correctCount} out of {questions.length}.
          </p>
        </div>
        <div className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-200">
          {score}%
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {questions.map((question, index) => {
          const selectedAnswer = answers[index];
          const isCorrect = selectedAnswer === question.correctAnswer;

          return (
            <div
              key={`${question.question}-${index}`}
              className={`rounded-2xl border p-5 ${
                isCorrect
                  ? "border-emerald-400/60 bg-emerald-400/5"
                  : "border-rose-500/50 bg-rose-500/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold">
                  {index + 1}. {question.question}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isCorrect
                      ? "bg-emerald-400/20 text-emerald-200"
                      : "bg-rose-500/20 text-rose-200"
                  }`}
                >
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              <div className="mt-3 text-sm text-slate-200">
                <p>
                  <span className="font-semibold">Your answer:</span>{" "}
                  {selectedAnswer ?? "No answer"}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Correct answer:</span>{" "}
                  {question.correctAnswer}
                </p>
                <p className="mt-3 text-slate-300">
                  <span className="font-semibold text-slate-200">
                    Explanation:
                  </span>{" "}
                  {question.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={onRestart}
        >
          Create another quiz
        </button>
      </div>
    </section>
  );
}
