import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import QuizGenerator from "./components/QuizGenerator";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Quizzer AI</h1>
            <p className="text-sm text-slate-400">
              Generate quizzes, track answers, and review explanations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>
      <main className="flex flex-1 justify-center px-6 py-10">
        <div className="w-full max-w-5xl">
          <SignedOut>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-10 text-center">
              <h2 className="text-2xl font-semibold">
                Sign in to create your quiz
              </h2>
              <p className="mt-2 text-slate-300">
                Choose a topic, difficulty, and question count to get started.
              </p>
              <div className="mt-6">
                <SignInButton mode="modal">
                  <button className="rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-900">
                    Get started
                  </button>
                </SignInButton>
              </div>
            </div>
          </SignedOut>
          <SignedIn>
            <QuizGenerator />
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
