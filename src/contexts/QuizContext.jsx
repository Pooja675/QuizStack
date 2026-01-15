import { useState, useEffect, createContext } from 'react';

// Quiz Context - Manages all quiz-related state
export const QuizContext = createContext();

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;


// Quiz Provider Component - Wraps the entire app
const QuizProvider = ({ children }) => {
  // Quiz Data State
  const [quizData, setQuizData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // PDF Upload State
  const [lastPdfFile, setLastPdfFile] = useState(null);
  const [lastNumQuestions, setLastNumQuestions] = useState(10);
  const [lastDifficulty, setLastDifficulty] = useState('medium');
  
  // Quiz Progress State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  
  // Quiz View State
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  
  // Timer State
  const [quizSettings, setQuizSettings] = useState(null);
  const [totalTimeLeft, setTotalTimeLeft] = useState(null);

  // Initialize user answers when quiz data changes
  useEffect(() => {
    if (quizData) {
      setUserAnswers(Array(quizData.questions.length).fill(null));
    }
  }, [quizData]);

  // Load saved progress from localStorage
  useEffect(() => {
    if (!quizData) return;
    
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

  // Save progress to localStorage
  useEffect(() => {
    if (quizData && !showSettings && !showResult && !showReview) {
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

  // PDF to Base64 conversion
  const convertPdfToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Generate quiz from PDF using Gemini API
  const generateQuizFromPdf = async (file, numQuestions, difficulty, language = 'auto') => {
    setIsGenerating(true);
    setError(null);
    
    setLastPdfFile(file);
    setLastNumQuestions(numQuestions);
    setLastDifficulty(difficulty);

    try {
      const base64Pdf = await convertPdfToBase64(file);

      const languageInstruction = language === 'auto' 
        ? `DETECT the language of the PDF document automatically and generate ALL quiz content (questions, options, explanations, and title) in the SAME language as the document.`
        : `Generate ALL quiz content (questions, options, explanations, and title) in ${language} language, regardless of the document's original language.`;

      const prompt = `You are an expert quiz generator. Analyze the following PDF document and create ${numQuestions} multiple-choice questions with ${difficulty} difficulty level.

CRITICAL INSTRUCTIONS:
1. You must respond with ONLY valid JSON. No explanations, no markdown, no code blocks, no additional text.
2. LANGUAGE REQUIREMENT: ${languageInstruction}
   - Maintain proper grammar and natural phrasing in the target language
   - Use culturally appropriate examples and context
   - Ensure all text elements are in the target language: title, questions, options, and explanations
3. Generate COMPLETELY DIFFERENT questions than any previous attempts. Focus on different topics, concepts, and aspects of the document to ensure variety.

Create a JSON object with this EXACT structure:
{
  "title": "Quiz about the document topic (in target language)",
  "language": "${language === 'auto' ? 'detected from document' : language}",
  "questions": [
    {
      "question": "Question text in target language",
      "options": ["Option A in target language", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation in target language"
    }
  ]
}

Requirements:
- Create exactly ${numQuestions} questions
- Each question must have exactly 4 options
- correctAnswer must be 0, 1, 2, or 3 (index of correct option)
- All questions based on document content
- Difficulty: ${difficulty}
- ALL content must be in the target language (${language === 'auto' ? 'auto-detected from document' : language})
- Response must be ONLY the JSON object, nothing else`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: 'application/pdf', data: base64Pdf } }
              ]
            }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate quiz');
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content) {
        throw new Error('Invalid response from Gemini API');
      }

      let generatedText = data.candidates[0].content.parts[0].text.trim();
      
      // Clean response
      generatedText = generatedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const startIndex = generatedText.indexOf('{');
      const endIndex = generatedText.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        generatedText = generatedText.substring(startIndex, endIndex + 1);
      }

      // Parse JSON
      let quizJson;
      try {
        quizJson = JSON.parse(generatedText);
      } catch (parseError) {
        // Try to fix incomplete JSON
        let fixedText = generatedText;
        const openBraces = (fixedText.match(/\{/g) || []).length;
        const closeBraces = (fixedText.match(/\}/g) || []).length;
        const openBrackets = (fixedText.match(/\[/g) || []).length;
        const closeBrackets = (fixedText.match(/\]/g) || []).length;
        
        for (let i = 0; i < openBrackets - closeBrackets; i++) fixedText += ']';
        for (let i = 0; i < openBraces - closeBraces; i++) fixedText += '}';
        
        quizJson = JSON.parse(fixedText);
      }

      if (!quizJson.questions?.length) {
        throw new Error('Invalid quiz format generated');
      }

      setQuizData(quizJson);
      setIsGenerating(false);
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
      setIsGenerating(false);
    }
  };

  // Reset quiz to initial state
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers(Array(quizData.questions.length).fill(null));
    setSelectedAnswer(null);
    setScore(0);
    setAnsweredQuestions([]);
    setShowResult(false);
    setShowReview(false);
    setShowSettings(true);
    setQuizSettings(null);
    setTotalTimeLeft(null);
  };

  // Load new document
  const loadNewDocument = () => {
    setQuizData(null);
    setError(null);
    setLastPdfFile(null);
    resetQuiz();
    localStorage.removeItem('quizProgress');
  };

  // Regenerate quiz from same document
  const regenerateQuiz = async () => {
    if (lastPdfFile) {
      resetQuiz();
      setQuizData(null);
      await generateQuizFromPdf(lastPdfFile, lastNumQuestions, lastDifficulty);
    }
  };

  const value = {
    // State
    quizData,
    isGenerating,
    error,
    currentQuestion,
    userAnswers,
    selectedAnswer,
    score,
    answeredQuestions,
    showResult,
    showReview,
    showSettings,
    quizSettings,
    totalTimeLeft,
    
    // Setters
    setError,
    setCurrentQuestion,
    setUserAnswers,
    setSelectedAnswer,
    setScore,
    setAnsweredQuestions,
    setShowResult,
    setShowReview,
    setShowSettings,
    setQuizSettings,
    setTotalTimeLeft,
    
    // Actions
    generateQuizFromPdf,
    resetQuiz,
    loadNewDocument,
    regenerateQuiz
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export default QuizProvider;