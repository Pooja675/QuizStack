import { useState } from "react";
import { useQuiz } from "../hooks/useQuiz";
import { trackDocumentUploaded, trackEvent } from "../utils/analytics";

const PdfUpload = () => {
  const { generateQuizFromPdf, isGenerating } = useQuiz();
  const [selectedFile, setSelectedFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [language, setLanguage] = useState('auto');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      
      // Track document upload
      trackDocumentUploaded('pdf', file.size);
      trackEvent('Document', 'Selected', file.name, Math.round(file.size / 1024)); // size in KB
    }
  };

  const handleGenerate = () => {
    if (selectedFile) {
      // Track quiz generation attempt
      trackEvent('Quiz', 'Generation Started', difficulty, numQuestions);
      trackEvent('Settings', 'Language Selected', language);
      trackEvent('Settings', 'Difficulty Selected', difficulty);
      trackEvent('Settings', 'Questions Count', numQuestions.toString(), numQuestions);
      
      generateQuizFromPdf(selectedFile, numQuestions, difficulty, language);
    }
  };

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    trackEvent('Settings', 'Difficulty Changed', newDifficulty);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    trackEvent('Settings', 'Language Changed', newLanguage);
  };

  const handleQuestionCountChange = (count) => {
    setNumQuestions(count);
    trackEvent('Settings', 'Question Count Changed', count.toString(), count);
  };

  const languages = [
    { code: 'auto', name: 'Auto-detect from PDF' },
    { code: 'English', name: 'English' },
    { code: 'Hindi', name: 'हिंदी (Hindi)' },
    { code: 'Spanish', name: 'Español (Spanish)' },
    { code: 'French', name: 'Français (French)' },
    { code: 'German', name: 'Deutsch (German)' },
    { code: 'Chinese', name: '中文 (Chinese)' },
    { code: 'Japanese', name: '日本語 (Japanese)' },
    { code: 'Korean', name: '한국어 (Korean)' },
    { code: 'Arabic', name: 'العربية (Arabic)' },
    { code: 'Portuguese', name: 'Português (Portuguese)' },
    { code: 'Russian', name: 'Русский (Russian)' },
    { code: 'Italian', name: 'Italiano (Italian)' },
    { code: 'Dutch', name: 'Nederlands (Dutch)' },
    { code: 'Turkish', name: 'Türkçe (Turkish)' },
    { code: 'Polish', name: 'Polski (Polish)' },
    { code: 'Vietnamese', name: 'Tiếng Việt (Vietnamese)' },
    { code: 'Thai', name: 'ไทย (Thai)' },
    { code: 'Indonesian', name: 'Bahasa Indonesia' },
    { code: 'Malay', name: 'Bahasa Melayu' },
    { code: 'Bengali', name: 'বাংলা (Bengali)' },
    { code: 'Tamil', name: 'தமிழ் (Tamil)' },
    { code: 'Telugu', name: 'తెలుగు (Telugu)' },
    { code: 'Marathi', name: 'मराठी (Marathi)' },
    { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)' },
    { code: 'Urdu', name: 'اردو (Urdu)' },
    { code: 'Punjabi', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'Kannada', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'Malayalam', name: 'മലയാളം (Malayalam)' },
    { code: 'Odia', name: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'Assamese', name: 'অসমীয়া (Assamese)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Quiz Generator</h1>
          <p className="text-gray-600">Upload a PDF and AI will generate quiz questions</p>
        </div>

        <div className="mb-6">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {selectedFile ? (
                <>
                  <svg className="w-12 h-12 mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-700 font-semibold">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">Click to change file</p>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 font-semibold">Click to upload PDF</p>
                  <p className="text-xs text-gray-400">or drag and drop</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isGenerating}
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions: {numQuestions}
          </label>
          <input
            type="range"
            min="5"
            max="20"
            value={numQuestions}
            onChange={(e) => handleQuestionCountChange(parseInt(e.target.value))}
            className="w-full"
            disabled={isGenerating}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Language
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'auto' 
              ? '🤖 AI will detect and use the document\'s language automatically'
              : `📝 Quiz will be generated in ${language}`}
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedFile || isGenerating}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating Quiz...' : 'Generate Quiz with AI'}
        </button>

        {isGenerating && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Analyzing your document...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfUpload;