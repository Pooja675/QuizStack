// src/components/DownloadScreen.jsx
import { useState } from 'react';
import { generateQuizOnlyPDF } from './GenerateQuizOnlyPDF';
import { generateQuizWithAnswersPDF } from './GenerateQuizWithAnswersPDF';

const DownloadScreen = ({ quizData, onProceed }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const isEnglishQuiz = () => {
    const lang = quizData?.language?.toLowerCase() || '';
    return !lang || 
           lang === 'english' || 
           lang === 'auto' || 
           lang.includes('english') ||
           lang.includes('auto-detect') ||
           lang === 'detected from document';
  };

  const handleDownloadQuizOnly = async () => {
    setIsDownloading(true);
    try {
      await generateQuizOnlyPDF(quizData);
    } catch (error) {
      console.error('Error downloading quiz:', error);
      alert('Failed to download quiz. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadQuizWithAnswers = async () => {
    setIsDownloading(true);
    try {
      await generateQuizWithAnswersPDF(quizData);
    } catch (error) {
      console.error('Error downloading quiz with answers:', error);
      alert('Failed to download quiz. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // If quiz is not in English, skip download screen
  if (!isEnglishQuiz()) {
    // Automatically proceed to quiz settings
    if (onProceed) {
      setTimeout(() => onProceed(), 0);
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quiz Generated Successfully!
          </h1>
          <p className="text-gray-600">
            {quizData?.title || 'Your quiz is ready'}
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              {quizData?.questions?.length || 0} Questions
            </span>
            {quizData?.language && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
                </svg>
                {quizData.language}
              </span>
            )}
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-400 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">
                Download Quiz for Distribution
              </h3>
              <p className="text-sm text-gray-600">
                Save time by downloading the quiz before attempting it. Perfect for tutors and educators.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadQuizOnly}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 bg-white border-2 border-blue-500 text-blue-600 font-semibold py-4 px-4 rounded-lg hover:bg-blue-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-left">
                <div className="font-bold">Quiz Only</div>
                <div className="text-xs text-blue-500">For students</div>
              </div>
            </button>

            <button
              onClick={handleDownloadQuizWithAnswers}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <div className="font-bold">Quiz + Answers</div>
                <div className="text-xs text-green-100">Answer key</div>
              </div>
            </button>
          </div>

          <div className="mt-4 bg-white rounded-lg p-3 border border-amber-200">
            <div className="flex items-start">
              <span className="text-lg mr-2">💡</span>
              <div className="text-xs text-gray-600">
                <strong className="text-gray-700">Tutor Benefits:</strong>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Download once, distribute to multiple students</li>
                  <li>Print or share digitally via email/LMS</li>
                  <li>Keep answer key for quick grading</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onProceed}
            disabled={isDownloading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition shadow-lg disabled:opacity-50"
          >
            {isDownloading ? 'Downloading...' : 'Start Quiz Preview'}
          </button>
          <button
            onClick={onProceed}
            disabled={isDownloading}
            className="px-6 py-4 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            Skip
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          You can also download the quiz after completing it
        </p>
      </div>
    </div>
  );
};

export default DownloadScreen;