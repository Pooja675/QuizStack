
const ReviewScreen = ({ questions, userAnswers, onEditAnswer, onSubmit, onCancel }) => {
 return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Review Your Answers</h2>
        
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            You've answered <span className="font-bold">{userAnswers.filter(a => a !== null).length}</span> out of{' '}
            <span className="font-bold">{questions.length}</span> questions.
            {userAnswers.filter(a => a !== null).length < questions.length && (
              <span className="block mt-2 text-red-600 font-semibold">
                ⚠️ You have unanswered questions!
              </span>
            )}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                userAnswers[idx] !== null
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-gray-800 flex-1">
                  {idx + 1}. {q.question}
                </p>
                <button
                  onClick={() => onEditAnswer(idx)}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  Edit
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {userAnswers[idx] !== null ? (
                  <>Your answer: <span className="font-semibold">{q.options[userAnswers[idx]]}</span></>
                ) : (
                  <span className="text-red-600 font-semibold">Not answered</span>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition"
          >
            Submit Quiz
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition"
          >
            Back to Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewScreen