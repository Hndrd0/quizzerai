"use client";

import { QuizQuestion } from "./QuizGenerator";

type QuizDisplayProps = {
  questions: QuizQuestion[];
  answers: Record<number, string>;
  onSelect: (index: number, option: string) => void;
  onSubmit: () => void;
};

export default function QuizDisplay({
  questions,
  answers,
  onSelect,
  onSubmit,
}: QuizDisplayProps) {
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">Your quiz</h3>
          <p className="text-sm text-slate-300">
            Select an answer for each question.
          </p>
        </div>
        <span className="text-sm text-slate-400">
          {answeredCount}/{questions.length} answered
        </span>
      </div>
      <div className="mt-6 flex flex-col gap-6">
        {questions.map((question, index) => (
          <div
            key={`${question.question}-${index}`}
            className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
          >
            <p className="text-lg font-semibold">
              {index + 1}. {question.question}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {question.options.map((option) => {
                const selected = answers[index] === option;
                return (
                  <button
                    key={option}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      selected
                        ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-200"
                        : "border-white/10 bg-slate-900/60 text-slate-100 hover:border-emerald-400/50"
                    }`}
                    type="button"
                    onClick={() => onSelect(index, option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          className="rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onSubmit}
          disabled={!allAnswered}
        >
          Submit quiz
        </button>
      </div>
    </section>
  );
}
