import { useState } from 'react'

const SettingsModal = ({ onClose, onStart }) => {
  const [timeLimit, setTimeLimit] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(60);

  const handleStart = () => {
    onStart({
      timeLimit: timeLimit === 0 ? null : timeLimit * 60,
      timePerQuestion: timePerQuestion
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz Settings</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Time Limit (minutes, 0 = No limit)
          </label>
          <input
            type="number"
            min="0"
            max="120"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time per Question (seconds)
          </label>
          <input
            type="number"
            min="10"
            max="300"
            value={timePerQuestion}
            onChange={(e) => setTimePerQuestion(parseInt(e.target.value) || 60)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleStart}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
          >
            Start Quiz
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal