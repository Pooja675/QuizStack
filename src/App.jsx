import { useState } from "react";
import PdfUpload from "./components/PdfUpload";
import Quiz from "./components/Quiz";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  const [quizData, setQuizData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [lastPdfFile, setLastPdfFile] = useState(null);
  const [lastNumQuestions, setLastNumQuestions] = useState(10);
  const [lastDifficulty, setLastDifficulty] = useState('medium');

  const convertPdfToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateQuizFromPdf = async (file, numQuestions, difficulty) => {
    setIsGenerating(true);
    setError(null);
    
    setLastPdfFile(file);
    setLastNumQuestions(numQuestions);
    setLastDifficulty(difficulty);

    try {
      const base64Pdf = await convertPdfToBase64(file);

      const prompt = `You are an expert quiz generator. Analyze the following PDF document and create ${numQuestions} multiple-choice questions with ${difficulty} difficulty level.

CRITICAL: You must respond with ONLY valid JSON. No explanations, no markdown, no code blocks, no additional text.

IMPORTANT: Generate COMPLETELY DIFFERENT questions than any previous attempts. Focus on different topics, concepts, and aspects of the document to ensure variety.

Create a JSON object with this EXACT structure:
{
  "title": "Quiz about the document topic",
  "questions": [
    {
      "question": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Requirements:
- Create exactly ${numQuestions} questions
- Each question must have exactly 4 options
- correctAnswer must be 0, 1, 2, or 3 (index of correct option)
- All questions based on document content
- Difficulty: ${difficulty}
- Response must be ONLY the JSON object, nothing else`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: 'application/pdf',
                      data: base64Pdf
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate quiz. Please check your API configuration.');
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Full API response:', data);
        throw new Error('Invalid response from Gemini API');
      }

      let generatedText = data.candidates[0].content.parts[0].text;
      console.log('Raw AI response:', generatedText);

      generatedText = generatedText.trim();
      generatedText = generatedText.replace(/```json\s*/g, '');
      generatedText = generatedText.replace(/```\s*/g, '');
      
      const startIndex = generatedText.indexOf('{');
      if (startIndex !== -1) {
        generatedText = generatedText.substring(startIndex);
      }
      
      const endIndex = generatedText.lastIndexOf('}');
      if (endIndex !== -1) {
        generatedText = generatedText.substring(0, endIndex + 1);
      }
      
      generatedText = generatedText.trim();
      console.log('Cleaned text:', generatedText);

      let quizJson;
      try {
        quizJson = JSON.parse(generatedText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Text that failed to parse:', generatedText);
        
        try {
          let fixedText = generatedText;
          
          const openBraces = (fixedText.match(/\{/g) || []).length;
          const closeBraces = (fixedText.match(/\}/g) || []).length;
          const openBrackets = (fixedText.match(/\[/g) || []).length;
          const closeBrackets = (fixedText.match(/\]/g) || []).length;
          
          for (let i = 0; i < openBrackets - closeBrackets; i++) {
            fixedText += ']';
          }
          for (let i = 0; i < openBraces - closeBraces; i++) {
            fixedText += '}';
          }
          
          console.log('Attempting to fix JSON with:', fixedText);
          quizJson = JSON.parse(fixedText);
          console.log('Successfully parsed fixed JSON!');
        } catch (fixError) {
          throw new Error('Could not parse quiz data from AI response. The AI may have returned invalid or incomplete JSON. Try generating with fewer questions.');
        }
      }

      if (!quizJson.questions || !Array.isArray(quizJson.questions) || quizJson.questions.length === 0) {
        throw new Error('Invalid quiz format generated');
      }
      
      if (quizJson.questions.length < numQuestions) {
        console.warn(`Generated ${quizJson.questions.length} questions instead of ${numQuestions}`);
      }

      setQuizData(quizJson);
      setIsGenerating(false);
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    setQuizData({ ...quizData });
  };

  const handleLoadNew = () => {
    setQuizData(null);
    setError(null);
    setLastPdfFile(null);
    localStorage.removeItem('quizProgress');
  };

  const handleRegenerateQuiz = async () => {
    if (lastPdfFile) {
      setQuizData(null);
      await generateQuizFromPdf(lastPdfFile, lastNumQuestions, lastDifficulty);
    }
  };

  if (quizData) {
    return <Quiz quizData={quizData} onRestart={handleRestart} onLoadNew={handleLoadNew} onRegenerateQuiz={handleRegenerateQuiz} />;
  }

  return (
    <>
      <PdfUpload onPdfUpload={generateQuizFromPdf} isGenerating={isGenerating} />
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
