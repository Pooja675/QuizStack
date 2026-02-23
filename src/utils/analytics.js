import ReactGA from 'react-ga4';

const MEASUREMENT_ID = import.meta.env.REACT_APP_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (MEASUREMENT_ID) {
    ReactGA.initialize(MEASUREMENT_ID, {
      gaOptions: {
        anonymizeIp: true, // GDPR compliance
      },
      gtagOptions: {
        send_page_view: false, // Disable automatic page views
      }
    });
    console.log('Google Analytics initialized');
  } else {
    console.warn('GA Measurement ID not found');
  }
};

// Track page views
export const trackPageView = (path, title) => {
  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title
  });
};

// Track custom events
export const trackEvent = (category, action, label, value) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
    value: value
  });
};

// Track quiz creation
export const trackQuizCreated = (topic, difficulty, questionCount) => {
  trackEvent('Quiz', 'Created', topic, questionCount);
  ReactGA.event({
    category: 'Quiz',
    action: 'Created',
    label: topic,
    difficulty: difficulty,
    question_count: questionCount
  });
};

// Track quiz completion
export const trackQuizCompleted = (quizId, score, timeTaken) => {
  trackEvent('Quiz', 'Completed', quizId, score);
  ReactGA.event({
    category: 'Quiz',
    action: 'Completed',
    quiz_id: quizId,
    score: score,
    time_taken_seconds: timeTaken
  });
};

// Track answer submission
export const trackAnswerSubmitted = (questionType, isCorrect) => {
  trackEvent('Question', 'Answered', questionType, isCorrect ? 1 : 0);
};

// Track document upload
export const trackDocumentUploaded = (fileType, fileSize) => {
  trackEvent('Document', 'Uploaded', fileType, fileSize);
};

// Track user registration
export const trackUserRegistration = (method) => {
  trackEvent('User', 'Registration', method);
};

// Track user login
export const trackUserLogin = (method) => {
  trackEvent('User', 'Login', method);
};

// Set user ID (for logged-in users)
export const setUserId = (userId) => {
  ReactGA.set({ userId: userId });
};

// Set user properties
export const setUserProperties = (properties) => {
  ReactGA.set(properties);
};