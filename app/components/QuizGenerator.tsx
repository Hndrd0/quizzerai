"use client";

import { useMemo, useState, type FormEvent } from "react";
import QuizDisplay from "./QuizDisplay";
import QuizResults from "./QuizResults";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type QuizPayload = {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
};

const difficultyOptions = ["Easy", "Medium", "Hard"] as const;

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof difficultyOptions)[number]>(
    "Medium",
  );
  const [count, setCount] = useState(10);
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  );

  const resetQuizState = () => {
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
  };

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError("Please enter a topic for the quiz.");
      return;
    }

    if (!Number.isInteger(count) || count < 5 || count > 50) {
      setError("Question count must be between 5 and 50.");
      return;
    }

    setLoading(true);
    setSubmitted(false);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: trimmedTopic,
          difficulty,
          count,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to generate quiz.");
      }

      setQuiz(payload);
      setAnswers({});
      setSubmitted(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate quiz.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [index]: option }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleRestart = () => {
    resetQuizState();
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Create a quiz</h2>
          <p className="text-sm text-slate-300">
            Choose a topic and difficulty, then let Groq generate the questions.
          </p>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={handleGenerate}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Topic
            <input
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white placeholder:text-slate-500"
              placeholder="e.g. World history"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              required
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Difficulty
              <select
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white"
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(
                    event.target.value as (typeof difficultyOptions)[number],
                  )
                }
              >
                {difficultyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Question count
              <input
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white"
                type="number"
                min={5}
                max={50}
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate quiz"}
            </button>
            {quiz && (
              <button
                className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white"
                type="button"
                onClick={handleRestart}
              >
                Start over
              </button>
            )}
            {quiz && !submitted && (
              <span className="text-sm text-slate-300">
                {answeredCount}/{quiz.questions.length} answered
              </span>
            )}
          </div>
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
        </form>
      </section>

      {quiz && !submitted && (
        <QuizDisplay
          questions={quiz.questions}
          answers={answers}
          onSelect={handleSelect}
          onSubmit={handleSubmit}
        />
      )}

      {quiz && submitted && (
        <QuizResults
          questions={quiz.questions}
          answers={answers}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
