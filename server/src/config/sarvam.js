/**
 * Sarvam AI Integration Service Constants
 */
export const SARVAM_BASE_URL = 'https://api.sarvam.ai';
export const SARVAM_STT_ENDPOINT = `${SARVAM_BASE_URL}/speech-to-text`;
export const SARVAM_LLM_ENDPOINT = `${SARVAM_BASE_URL}/v1/chat/completions`;

// Default Model configurations
export const SARVAM_STT_MODEL = 'saaras:v3';
export const SARVAM_LLM_MODEL = 'sarvam-30b'; // Valid Sarvam LLM model
