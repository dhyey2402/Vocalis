# API Contract

This document outlines the core backend API endpoints for the Text-to-Speech application.

## 1. Generate Speech

- **Endpoint**: `/api/tts`
- **Method**: `POST`
- **Description**: Accepts text, language, and voice parameters, and returns a URL to the generated audio file.

### Request
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "text": "Welcome to our application.",
    "language": "en-US",
    "voice": "voice-name"
  }
  ```

### Response
- **Success (200 OK)**:
  ```json
  {
    "success": true,
    "audio_url": "/audio/generated-file.mp3"
  }
  ```

### Validation Expectations
- `text` is required, must be a string, and cannot exceed the defined maximum character limit.
- `language` is required and must match an allowed language code.
- `voice` is required and must match an available voice for the selected language.

### Error Scenarios
- **400 Bad Request**: Missing required fields or validation failure (e.g., text too long).
- **429 Too Many Requests**: Rate limit exceeded for the client.
- **500 Internal Server Error**: TTS provider failure or unexpected backend error.

---

## 2. Get Available Voices

- **Endpoint**: `/api/voices`
- **Method**: `GET`
- **Description**: Returns a list of available languages and their corresponding voices.

### Request
- No request body.

### Response
- **Success (200 OK)**:
  ```json
  {
    "success": true,
    "voices": [
      {
        "language": "en-US",
        "voice_id": "voice-name-1",
        "name": "Standard Female"
      },
      {
        "language": "en-US",
        "voice_id": "voice-name-2",
        "name": "Standard Male"
      }
    ]
  }
  ```
*(Exact structure may vary slightly depending on the chosen TTS provider's data model).*

### Error Scenarios
- **500 Internal Server Error**: Failed to retrieve voice list from the TTS provider.

---

## 3. Health Check

- **Endpoint**: `/api/health`
- **Method**: `GET`
- **Description**: Used to verify that the backend API is running and responsive.

### Request
- No request body.

### Response
- **Success (200 OK)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2023-10-27T10:00:00Z"
  }
  ```
