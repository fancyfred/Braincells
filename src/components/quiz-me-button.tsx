'use client';

import Link from 'next/link';

export function QuizMeButton() {
  return (
    <Link href="/quiz" className="quiz-me-button">
      <span className="quiz-me-icon">🧠</span>
      <span className="quiz-me-text">Quiz Me</span>
    </Link>
  );
}

