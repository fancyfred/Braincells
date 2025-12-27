'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/lib/quiz-generator';

interface QuizProps {
  questions: QuizQuestion[];
  topicTitle: string;
}

export function Quiz({ questions, topicTitle }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleAnswerSelect = (answer: string) => {
    if (answered) return;
    setSelectedAnswer(answer);
    setAnswered(true);
    
    // Compare case-insensitively since options are capitalized
    const correctAnswer = questions[currentQuestion].correctAnswer;
    if (answer.toLowerCase() === correctAnswer.toLowerCase()) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-result">
        <h2>Quiz Complete!</h2>
        <div className="quiz-score">
          <div className="score-number">{score} / {questions.length}</div>
          <div className="score-percentage">{percentage}%</div>
        </div>
        <p className="score-message">
          {percentage === 100 && "Perfect! You're a true expert! 🎉"}
          {percentage >= 80 && percentage < 100 && "Excellent! Great job! 🌟"}
          {percentage >= 60 && percentage < 80 && "Good work! Keep learning! 👍"}
          {percentage < 60 && "Keep practicing! You'll get better! 💪"}
        </p>
        <button onClick={handleRestart} className="btn primary">
          Try Again
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{topicTitle} Quiz</h2>
        <div className="quiz-progress">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>
      
      <div className="quiz-question">
        <p className="question-text">{question.question}</p>
        
        <div className="quiz-options">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option.toLowerCase() === question.correctAnswer.toLowerCase();
            let className = 'quiz-option';
            
            if (answered) {
              if (isCorrect) {
                className += ' correct';
              } else if (isSelected && !isCorrect) {
                className += ' incorrect';
              }
            } else if (isSelected) {
              className += ' selected';
            }
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={className}
                disabled={answered}
              >
                {option}
              </button>
            );
          })}
        </div>
        
        {answered && (
          <div className="quiz-feedback">
            {selectedAnswer && selectedAnswer.toLowerCase() === question.correctAnswer.toLowerCase() ? (
              <div className="feedback correct-feedback">
                ✓ Correct! {question.factText}
              </div>
            ) : (
              <div className="feedback incorrect-feedback">
                ✗ Incorrect. The correct answer is "{question.correctAnswer}". {question.factText}
              </div>
            )}
            <button onClick={handleNext} className="btn primary quiz-next">
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

