# High-Level Architecture

The Text-to-Speech application utilizes a decoupled client-server architecture consisting of a React frontend and a Flask backend.

## Architectural Flow
```text
User
  ↓
React Frontend
  ↓ HTTP Request
Flask Backend API
  ↓ API Request
Text-to-Speech Service
  ↓ Audio Response
Flask Backend
  ↓ Audio Response
React Frontend
  ↓
Audio Player / Download
```

## React Frontend
- **Role**: Client-side application responsible for user interaction and presentation.
- **Responsibilities**:
  - Render the user interface (text area, dropdowns, audio controls).
  - Manage application state (input text, selected options, loading state, audio URL).
  - Perform client-side validation (character limits, empty checks).
  - Make HTTP requests to the Flask backend.
  - Handle and display errors gracefully.
  - Play back audio and facilitate downloads.

## Flask Backend
- **Role**: Server-side API that acts as an intermediary between the frontend and the external TTS service.
- **Responsibilities**:
  - Expose API endpoints for the frontend (`/api/tts`, `/api/voices`, `/api/health`).
  - Perform strict server-side validation on all incoming requests.
  - Securely manage API keys and credentials for the TTS service.
  - Formulate and send requests to the third-party TTS provider.
  - Handle TTS service responses, including error mapping and retries if necessary.
  - Temporarily store or proxy generated audio files back to the frontend.
  - Implement security measures such as CORS and rate limiting.

## TTS Provider
- **Role**: External third-party service that performs the actual text-to-audio conversion.
- **Responsibilities**:
  - Accept valid text and voice parameters.
  - Generate high-quality audio streams.
  - Provide a list of supported languages and voices.

## Audio Response Flow
1. The Flask backend receives the audio stream/file from the TTS provider.
2. The backend temporarily saves the audio file to the `generated_audio/` directory (or streams it directly).
3. The backend responds to the frontend with a URL pointing to the audio resource (e.g., `/audio/generated-file.mp3`).
4. The React frontend uses this URL as the source for an HTML5 `<audio>` element or a download link.

## API Communication
- All communication between the frontend and backend occurs over HTTP(S).
- Requests and responses utilize JSON payloads for data exchange (excluding the actual audio binary data, which is fetched via a URL or streamed).
