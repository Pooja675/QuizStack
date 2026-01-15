import { useQuiz } from "../hooks/useQuiz";

const Results = () => {
  const { quizData, score, answeredQuestions, resetQuiz, loadNewDocument, regenerateQuiz } = useQuiz();
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
            onClick={resetQuiz}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
          >
            Retake Same Quiz
          </button>
          <button
            onClick={regenerateQuiz}
            className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition"
          >
            Generate New Quiz
          </button>
          <button
            onClick={loadNewDocument}
            className="flex-1 bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition"
          >
            New Document
          </button>
        </div>
      </div>
    </div>
  );

}

export default Results