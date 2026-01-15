import PdfUpload from "./components/PdfUpload";
import Quiz from "./components/Quiz";
import Results from "./components/Results";
import ReviewScreen from "./components/ReviewScreen";
import { useQuiz } from "./hooks/useQuiz";


function App() {
 const { quizData, showResult, showReview, error, setError } = useQuiz();

  if (showResult) {
    return <Results />;
  }

  if (showReview) {
    return <ReviewScreen />;
  }

  if (quizData) {
    return <Quiz />;
  }

  return (
    <>
      <PdfUpload />
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md z-50">
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );

}

export default App;
