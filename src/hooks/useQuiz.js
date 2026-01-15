import {useContext } from "react";
import { QuizContext } from "../contexts/QuizContext";


// Custom hook to use Quiz Context
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
};