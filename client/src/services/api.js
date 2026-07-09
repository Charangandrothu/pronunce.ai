import axios from 'axios';

// Auto-normalize: ensure the base URL always ends with /api
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = rawUrl.replace(/\/api\/?$/, '') + '/api';

const API = axios.create({
  baseURL: BASE_URL
});

/**
 * Uploads audio files as multipart/form-data.
 * Passes loaded progress events up to hook controllers.
 * @param {File} file The audio file
 * @param {Function} onProgress Progress callback
 */
export const uploadAudio = async (file, onProgress) => {
  // If it's a demo file or trigger, bypass actual network uploads and mock the ID
  if (file && file.isDemo) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            fileId: 'demo_session_id',
            filename: 'demo_recording.mp3',
            duration: 35
          }
        });
      }, 500);
    });
  }

  const formData = new FormData();
  formData.append('file', file);

  return API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total || progressEvent.loaded
        });
      }
    }
  });
};

/**
 * Triggers Speech-to-Text and LLM evaluation processing loops.
 * @param {string} fileId Upload file identifier uuid string
 */
export const analyzeSpeech = async (fileId) => {
  // Mock analysis trigger if bypass demo mode is selected
  if (fileId === 'demo_session_id') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            data: {
              overallScore: 82,
              pronunciation: 79,
              fluency: 88,
              clarity: 81,
              confidence: 84,
              transcript: "Today I am introducing my project...",
              transcription: "Today I am introducing my project...",
              mistakes: [
                {
                  word: "project",
                  issue: "Incorrect stress",
                  severity: "warning",
                  suggestion: "Stress the first syllable."
                }
              ],
              practiceWords: [
                {
                  word: "project",
                  difficulty: "Medium",
                  ipa: "/ˈprɒdʒekt/"
                }
              ],
              summary: "Overall good pronunciation with minor stress placement issues."
            }
          }
        });
      }, 1500);
    });
  }

  return API.post('/analyze', { fileId });
};

/**
 * Compatible helper to request analysis metrics.
 * @param {string} sessionId File/session id
 */
export const getResults = async (sessionId) => {
  return analyzeSpeech(sessionId);
};

/**
 * Basic health diagnostics checking if API endpoints respond.
 */
export const healthCheck = async () => {
  const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  const res = await axios.get(`${backendUrl}/health`);
  return res.data;
};
