import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const allowedDifficulties = ["Easy", "Medium", "Hard"] as const;

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type QuizResponse = {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
};

function parseQuizContent(content: string): QuizQuestion[] {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Quiz response was not valid JSON.");
  }

  const parsed = JSON.parse(match[0]);
  if (!parsed || !Array.isArray(parsed.questions)) {
    throw new Error("Quiz response was missing questions.");
  }

  const questions: QuizQuestion[] = parsed.questions.map(
    (question: QuizQuestion) => ({
    question: String(question.question ?? "").trim(),
    options: Array.isArray(question.options)
      ? question.options.map((option) => String(option))
      : [],
    correctAnswer: String(question.correctAnswer ?? "").trim(),
    explanation: String(question.explanation ?? "").trim(),
  }),
  );

  const sanitized = questions.filter(
    (question: QuizQuestion) =>
      question.question &&
      question.options.length >= 2 &&
      question.correctAnswer,
  );

  if (!sanitized.length) {
    throw new Error("Quiz response did not include valid questions.");
  }

  return sanitized.map((question) => {
    const normalizedOptions = question.options
      .map((option) => option.trim())
      .filter(Boolean);
    const correctAnswer = normalizedOptions.includes(question.correctAnswer)
      ? question.correctAnswer
      : normalizedOptions[0] ?? question.correctAnswer;

    return {
      ...question,
      options: normalizedOptions,
      correctAnswer,
    };
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return NextResponse.json(
      { error: "Missing GROQ API key." },
      { status: 500 },
    );
  }

  const groq = new Groq({
    apiKey: groqApiKey,
  });

  try {
    const body = await request.json();
    const topic = String(body.topic ?? "").trim();
    const difficulty = String(body.difficulty ?? "Medium");
    const count = Number(body.count ?? 10);

    if (!topic) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    if (!Number.isInteger(count) || count < 5 || count > 50) {
      return NextResponse.json(
        { error: "Question count must be between 5 and 50." },
        { status: 400 },
      );
    }

    if (
      !allowedDifficulties.includes(
        difficulty as (typeof allowedDifficulties)[number],
      )
    ) {
      return NextResponse.json(
        { error: "Difficulty must be Easy, Medium, or Hard." },
        { status: 400 },
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      temperature: 0.4,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: [
            "You are a quiz generator. Respond with JSON only using the schema:",
            '{"questions": [{"question": string, "options": string[], "correctAnswer": string, "explanation": string}]}.',
            "Options must be full answer strings, not letters.",
          ].join(" "),
        },
        {
          role: "user",
          content: `Create ${count} ${difficulty} multiple-choice questions about "${topic}". Provide exactly four options per question with one correct answer and a brief explanation.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const questions = parseQuizContent(content);

    const response: QuizResponse = {
      topic,
      difficulty,
      questions: questions.slice(0, count),
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate quiz.",
      },
      { status: 500 },
    );
  }
}
