/**
 * analysisService.js
 *
 * Centralised service layer for all pronunciation analysis API calls.
 * Use these functions instead of calling axios directly from components.
 */
import axios from 'axios';

// Auto-normalize: ensure the base URL always ends with /api
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = rawUrl.replace(/\/api\/?$/, '') + '/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 120000 // 2 min — LLM calls can take time
});

/**
 * Uploads an audio File to the backend.
 * @param {File} file           Audio file object
 * @param {Function} onProgress Upload progress callback ({ loaded, total })
 * @returns {Promise<{ fileId: string, duration: number }>}
 */
export const uploadAudio = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await API.post('/upload', formData, {
    onUploadProgress: (evt) => {
      if (onProgress) {
        onProgress({ loaded: evt.loaded, total: evt.total || evt.loaded });
      }
    }
  });

  return response.data;
};

/**
 * Triggers STT → LLM pronunciation analysis for the uploaded file.
 * @param {string} fileId  UUID returned by uploadAudio
 * @returns {Promise<AnalysisResult>}  Full analysis JSON
 */
export const analyzeAudio = async (fileId) => {
  const response = await API.post('/analyze', { fileId });
  // Normalise to always return the inner data object
  return response.data?.data || response.data;
};

/**
 * Convenience alias — fetches analysis by session/file ID.
 * @param {string} id  fileId / sessionId
 */
export const getAnalysis = async (id) => analyzeAudio(id);
