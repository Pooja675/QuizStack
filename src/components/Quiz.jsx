import { useEffect, useState } from "react";
import Timer from "./Timer";
import ReviewScreen from "./ReviewScreen";
import SettingsModal from "./SettingsModal";

const Quiz = ({ quizData, onRestart, onLoadNew, onRegenerateQuiz }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState(Array(quizData.questions.length).fill(null));
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [quizSettings, setQuizSettings] = useState(null);
  const [showSettings, setShowSettings] = useState(true);
  const [totalTimeLeft, setTotalTimeLeft] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Load saved progress
  useEffect(() => {
    const savedProgress = localStorage.getItem('quizProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      if (progress.quizTitle === quizData.title && progress.questionCount === quizData.questions.length) {
        const shouldResume = window.confirm('You have an incomplete quiz. Do you want to resume?');
        if (shouldResume) {
          setCurrentQuestion(progress.currentQuestion);
          setUserAnswers(progress.userAnswers);
          setQuizSettings(progress.settings);
          setShowSettings(false);
          if (progress.settings?.timeLimit) {
            setTotalTimeLeft(progress.totalTimeLeft);
          }
        } else {
          localStorage.removeItem('quizProgress');
        }
      }
    }
  }, [quizData]);

  // Save progress
  useEffect(() => {
    if (!showSettings && !showResult && !showReview) {
      const progress = {
        quizTitle: quizData.title,
        questionCount: quizData.questions.length,
        currentQuestion,
        userAnswers,
        settings: quizSettings,
        totalTimeLeft
      };
      localStorage.setItem('quizProgress', JSON.stringify(progress));
    }
  }, [currentQuestion, userAnswers, quizSettings, totalTimeLeft, showSettings, showResult, showReview, quizData]);

  const handleStartQuiz = (settings) => {
    setQuizSettings(settings);
    if (settings.timeLimit) {
      setTotalTimeLeft(settings.timeLimit);
    }
    setQuestionStartTime(Date.now());
  };

  const handleAnswerClick = (index) => {
    // Allow changing answer - remove the restriction
    setSelectedAnswer(index);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = index;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1]);
      setQuestionStartTime(Date.now());
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

  const handleReviewSubmit = () => {
    calculateScore();
    setShowReview(false);
    setShowResult(true);
    localStorage.removeItem('quizProgress');
  };

  const handleEditAnswer = (questionIndex) => {
    setCurrentQuestion(questionIndex);
    setSelectedAnswer(userAnswers[questionIndex]);
    setShowReview(false);
  };

  const handleQuestionTimeUp = () => {
    // Move to next question when time expires
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1]);
      setQuestionStartTime(Date.now());
    } else {
      setShowReview(true);
    }
  };

  const handleTotalTimeUp = () => {
    calculateScore();
    setShowResult(true);
    localStorage.removeItem('quizProgress');
  };

  const calculateScore = () => {
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
  };

  if (showSettings) {
    return <SettingsModal onClose={() => setShowSettings(false)} onStart={handleStartQuiz} />;
  }

  if (showReview) {
    return (
      <ReviewScreen
        questions={quizData.questions}
        userAnswers={userAnswers}
        onEditAnswer={handleEditAnswer}
        onSubmit={handleReviewSubmit}
        onCancel={() => setShowReview(false)}
      />
    );
  }

  if (showResult) {
    const percentage = Math.round((score / quizData.questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Quiz Complete!</h2>
          
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6 mb-6">
            <p className="text-5xl font-bold text-center text-blue-600">
              {score} / {quizData.questions.length}
            </p>
            <p className="text-center text-2xl font-semibold text-gray-700 mt-2">
              {percentage}%
            </p>
            <p className="text-center text-gray-600 mt-2">
              {percentage === 100 ? "Perfect score! 🎉" : 
               percentage >= 80 ? "Excellent work! 🌟" :
               percentage >= 70 ? "Great job! 👏" : 
               percentage >= 50 ? "Good effort! 👍" : "Keep practicing! 💪"}
            </p>
          </div>

          <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-lg text-gray-700">Review Your Answers:</h3>
            {answeredQuestions.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${item.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className="font-medium text-gray-800 mb-2">{idx + 1}. {item.question}</p>
                <p className={`text-sm ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {item.selected !== null ? (
                    <>Your answer: {quizData.questions[idx].options[item.selected]}
                    {!item.isCorrect && ` (Correct: ${quizData.questions[idx].options[item.correct]})`}</>
                  ) : (
                    <span>Not answered (Correct: {quizData.questions[idx].options[item.correct]})</span>
                  )}
                </p>
                {item.explanation && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    💡 {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
            >
              Retake Same Quiz
            </button>
            <button
              onClick={onRegenerateQuiz}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition"
            >
              Generate New Quiz
            </button>
            <button
              onClick={onLoadNew}
              className="flex-1 bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition"
            >
              New Document
            </button>
          </div>
        </div>
      </div>
    );
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
