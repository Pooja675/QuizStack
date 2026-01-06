import { useState } from "react";

const Quiz = ({ quizData, onRestart, onLoadNew, onRegenerateQuiz }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  const handleAnswerClick = (index) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
      
      const isCorrect = index === quizData.questions[currentQuestion].correctAnswer;
      if (isCorrect) {
        setScore(score + 1);
      }
      
      setAnsweredQuestions([...answeredQuestions, {
        question: quizData.questions[currentQuestion].question,
        selected: index,
        correct: quizData.questions[currentQuestion].correctAnswer,
        isCorrect,
        explanation: quizData.questions[currentQuestion].explanation
      }]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

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
                  Your answer: {quizData.questions[idx].options[item.selected]}
                  {!item.isCorrect && ` (Correct: ${quizData.questions[idx].options[item.correct]})`}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{quizData.title || 'AI Generated Quiz'}</h1>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              Score: {score}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {currentQ.question}
        </h2>

        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 text-left rounded-lg font-medium transition ${
                selectedAnswer === null
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  : selectedAnswer === index
                  ? index === currentQ.correctAnswer
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : index === currentQ.correctAnswer
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {selectedAnswer !== null && currentQ.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Explanation:</span> {currentQ.explanation}
            </p>
          </div>
        )}

        {selectedAnswer !== null && (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
          >
            {currentQuestion < quizData.questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );

};

export default Quiz;
