import { useEffect, useState } from "react";
import Timer from "./Timer";
import SettingsModal from "./SettingsModal";
import { useQuiz } from "../hooks/useQuiz";

const Quiz = () => {
    const {
    quizData,
    currentQuestion,
    userAnswers,
    selectedAnswer,
    showSettings,
    quizSettings,
    totalTimeLeft,
    setCurrentQuestion,
    setUserAnswers,
    setSelectedAnswer,
    setShowSettings,
    setQuizSettings,
    setTotalTimeLeft,
    setShowReview,
    setShowResult,
    setScore,
    setAnsweredQuestions
  } = useQuiz();

  const handleStartQuiz = (settings) => {
    setQuizSettings(settings);
    if (settings.timeLimit) {
      setTotalTimeLeft(settings.timeLimit);
    }
  };

  const handleAnswerClick = (index) => {
    setSelectedAnswer(index);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = index;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1]);
    } else {
      setShowReview(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(userAnswers[currentQuestion - 1]);
    }
  };

  const handleQuestionTimeUp = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1]);
    } else {
      setShowReview(true);
    }
  };

  const handleTotalTimeUp = () => {
    let calculatedScore = 0;
    const answers = [];
    
    userAnswers.forEach((answer, idx) => {
      const isCorrect = answer === quizData.questions[idx].correctAnswer;
      if (isCorrect) calculatedScore++;
      
      answers.push({
        question: quizData.questions[idx].question,
        selected: answer,
        correct: quizData.questions[idx].correctAnswer,
        isCorrect,
        explanation: quizData.questions[idx].explanation
      });
    });
    
    setScore(calculatedScore);
    setAnsweredQuestions(answers);
    setShowResult(true);
    localStorage.removeItem('quizProgress');
  };

  if (showSettings) {
    return <SettingsModal onClose={() => setShowSettings(false)} onStart={handleStartQuiz} />;
  }

  const currentQ = quizData.questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{quizData.title || 'AI Generated Quiz'}</h1>
          
          {quizSettings?.timeLimit && (
            <Timer
              duration={totalTimeLeft}
              onTimeUp={handleTotalTimeUp}
              isActive={true}
            />
          )}
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              Answered: {userAnswers.filter(a => a !== null).length}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {quizSettings?.timePerQuestion && (
            <Timer
              duration={quizSettings.timePerQuestion}
              onTimeUp={handleQuestionTimeUp}
              isActive={true}
              key={currentQuestion}
            />
          )}
        </div>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {currentQ.question}
        </h2>

        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              className={`w-full p-4 text-left rounded-lg font-medium transition ${
                selectedAnswer === index
                  ? 'bg-blue-500 text-white ring-2 ring-blue-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedAnswer === index
                    ? 'border-white bg-white'
                    : 'border-gray-400'
                }`}>
                  {selectedAnswer === index && (
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            <button
              onClick={handleNextQuestion}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
            >
              {currentQuestion < quizData.questions.length - 1 ? 'Next →' : 'Review Answers'}
            </button>
          </div>

          <button
            onClick={() => setShowReview(true)}
            className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition"
          >
            📋 Review All Answers
          </button>
        </div>
      </div>
    </div>
  );

};

export default Quiz;
