import { useQuiz } from "../hooks/useQuiz";
import { trackEvent } from "../utils/analytics";

const ReviewScreen = () => {
  const {
    quizData,
    userAnswers,
    setCurrentQuestion,
    setSelectedAnswer,
    setShowReview,
    setShowResult,
    setScore,
    setAnsweredQuestions,
  } = useQuiz();

  const handleEditAnswer = (questionIndex) => {
    // Track when user edits an answer
    trackEvent('Review', 'Edit Answer', `Question ${questionIndex + 1}`, questionIndex + 1);
    
    setCurrentQuestion(questionIndex);
    setSelectedAnswer(userAnswers[questionIndex]);
    setShowReview(false);
  };

  const handleSubmit = () => {
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
        explanation: quizData.questions[idx].explanation,
      });
    });

    // Track quiz submission
    const answeredCount = userAnswers.filter((a) => a !== null).length;
    const totalQuestions = quizData.questions.length;
    const percentageScore = Math.round((calculatedScore / totalQuestions) * 100);
    
    trackEvent('Quiz', 'Submitted from Review', 'Quiz Completed', calculatedScore);
    trackEvent('Quiz', 'Completion Rate', `${answeredCount}/${totalQuestions}`, answeredCount);
    trackEvent('Quiz', 'Score Percentage', `${percentageScore}%`, percentageScore);

    setScore(calculatedScore);
    setAnsweredQuestions(answers);
    setShowReview(false);
    setShowResult(true);
    localStorage.removeItem("quizProgress");
  };

  const handleBackToQuiz = () => {
    // Track when user goes back to quiz without submitting
    trackEvent('Review', 'Back to Quiz', 'User returned to edit answers');
    setShowReview(false);
  };

  // Track review screen view metrics on load
  const answeredCount = userAnswers.filter((a) => a !== null).length;
  const unansweredCount = quizData.questions.length - answeredCount;
  
  // Track if user has unanswered questions
  if (unansweredCount > 0) {
    trackEvent('Review', 'Unanswered Questions', `${unansweredCount} questions`, unansweredCount);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Review Your Answers
        </h2>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            You've answered{" "}
            <span className="font-bold">
              {answeredCount}
            </span>{" "}
            out of{" "}
            <span className="font-bold">{quizData.questions.length}</span>{" "}
            questions.
            {answeredCount < quizData.questions.length && (
              <span className="block mt-2 text-red-600 font-semibold">
                ⚠️ You have unanswered questions!
              </span>
            )}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {quizData.questions.map((q, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                userAnswers[idx] !== null
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-gray-800 flex-1">
                  {idx + 1}. {q.question}
                </p>
                <button
                  onClick={() => handleEditAnswer(idx)}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  Edit
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {userAnswers[idx] !== null ? (
                  <>
                    Your answer:{" "}
                    <span className="font-semibold">
                      {q.options[userAnswers[idx]]}
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 font-semibold">
                    Not answered
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition"
          >
            Submit Quiz
          </button>
          <button
            onClick={handleBackToQuiz}
            className="flex-1 bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition"
          >
            Back to Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewScreen;