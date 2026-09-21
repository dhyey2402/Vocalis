import { API_BASE_URL, USE_MOCK_API } from './config';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

const handleResponse = async (response) => {
  if (response.ok) {
    if (response.status === 204) return null;
    return await response.json();
  }

  let errorMessage = 'An unexpected error occurred';
  let errorData = null;

  try {
    errorData = await response.json();
    if (errorData && errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData && errorData.error) {
      errorMessage = errorData.error;
    }
  } catch {
    // Response was not JSON, rely on HTTP status code mapping below
  }

  // Handle specific HTTP status codes as outlined in the project specification
  switch (response.status) {
    case 400:
      errorMessage = errorMessage !== 'An unexpected error occurred' ? errorMessage : 'Invalid request. Please check your input parameters.';
      break;
    case 401:
      errorMessage = errorMessage !== 'An unexpected error occurred' ? errorMessage : 'Unauthorized. Please check your credentials.';
      break;
    case 403:
      errorMessage = errorMessage !== 'An unexpected error occurred' ? errorMessage : 'Forbidden. You do not have permission to access this resource.';
      break;
    case 404:
      errorMessage = errorMessage !== 'An unexpected error occurred' ? errorMessage : 'Resource not found.';
      break;
    case 429:
      errorMessage = errorMessage !== 'An unexpected error occurred' ? errorMessage : 'Too many requests. Please wait a moment and try again.';
      break;
    case 500:
      errorMessage = errorMessage !== 'An unexpected error occurred' ? errorMessage : 'Internal server error. The backend encountered an unexpected problem.';
      break;
    case 503:
      errorMessage = errorMessage !== 'An unexpected error occurred' ? errorMessage : 'External service unavailable. The TTS provider might be down.';
      break;
    default:
      errorMessage = errorMessage !== 'An unexpected error occurred' ? errorMessage : `HTTP Error ${response.status}`;
  }

  throw new ApiError(errorMessage, response.status, errorData);
};

export const checkHealth = async () => {
  if (USE_MOCK_API) {
    console.log('[MOCK API] checkHealth called');
    return new Promise(resolve => setTimeout(() => resolve({ status: 'ok' }), 500));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/health`, { credentials: 'include' });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Network error. Could not connect to the backend server.');
  }
};

export const fetchVoices = async () => {
  if (USE_MOCK_API) {
    console.log('[MOCK API] fetchVoices called');
    // Simulate fetching voices from backend
    const { AVAILABLE_VOICES } = await import('../data/voices');
    return new Promise(resolve => setTimeout(() => resolve(AVAILABLE_VOICES), 500));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/voices`, { credentials: 'include' });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Network error. Could not fetch available voices.');
  }
};

export const generateSpeech = async (payload) => {
  const { text, language, voice, stability, similarityBoost } = payload;
  
  if (USE_MOCK_API) {
    console.log('[MOCK API] generateSpeech called with:', payload);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Special testing triggers to demonstrate error handling without a real backend
        if (text.includes('TEST_400')) return reject(new ApiError('Invalid request. Please check your input parameters.', 400));
        if (text.includes('TEST_401')) return reject(new ApiError('Unauthorized.', 401));
        if (text.includes('TEST_403')) return reject(new ApiError('Forbidden.', 403));
        if (text.includes('TEST_404')) return reject(new ApiError('Resource not found.', 404));
        if (text.includes('TEST_429')) return reject(new ApiError('Too many requests. Please wait a moment and try again.', 429));
        if (text.includes('TEST_500')) return reject(new ApiError('Internal server error. The backend encountered an unexpected problem.', 500));
        if (text.includes('TEST_503')) return reject(new ApiError('External service unavailable. The TTS provider might be down.', 503));
        if (text.includes('TEST_NETWORK')) return reject(new Error('Network error. Could not connect to the backend server.'));
        
        resolve({ success: true, audio_url: 'mock-audio-url' });
      }, 1500);
    });
  }

  try {
    // Send JSON request with Content-Type application/json
    const response = await fetch(`${API_BASE_URL}/tts`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: payload.text,
        language: payload.language,
        voice: payload.voice,
        sections: payload.sections || [],
        listeningData: payload.listeningData || null,
        stability: payload.stability,
        similarity_boost: payload.similarityBoost
      })
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Network error. Could not generate speech. Please check your connection.');
  }
};

export const getLibrary = async () => {
  if (USE_MOCK_API) {
    console.log('[MOCK API] getLibrary called');
    return new Promise(resolve => setTimeout(() => resolve({ success: true, generations: [] }), 500));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/audio/`, { credentials: 'include' });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Network error. Could not fetch library.');
  }
};

export const deleteGeneration = async (id) => {
  if (USE_MOCK_API) {
    console.log('[MOCK API] deleteGeneration called with id:', id);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/audio/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Network error. Could not delete generation.');
  }
};
export const updateGenerationTitle = async (id, title) => {
  if (USE_MOCK_API) {
    console.log('[MOCK API] updateGenerationTitle called with id:', id, 'title:', title);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, generation: { id, title } }), 500));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/audio/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Network error. Could not rename generation.');
  }
};
