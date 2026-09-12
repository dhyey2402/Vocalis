# Vocalis - Text-to-Speech Application

## Project Overview
Vocalis is a Text-to-Speech (TTS) web application that converts written text into high-quality speech. It provides a user-friendly interface for generating, playing, and downloading audio from text.

## Problem Statement
Users need a straightforward, reliable, and accessible tool to convert written text into spoken audio for various purposes, including accessibility, content creation, and personal use.

## Objectives
- Build a robust and scalable web application for text-to-speech conversion.
- Provide a responsive and intuitive user interface.
- Ensure secure and efficient communication between the frontend and backend.
- Establish a solid foundation for integrating a third-party TTS service.

## Core Features
- Text input and manipulation (enter, paste, clear, modify)
- Character and word count tracking, including maximum character limits
- Language and voice selection
- Speech generation
- Audio playback controls (play, pause, seek, volume adjust)
- Audio download functionality
- Comprehensive validation and error handling

## Selected Technology Stack 
**Frontend:**
- HTML5, CSS3, JavaScript
- React.js
- Tailwind CSS

**Backend:**
- Python, Flask

**Development Tools:**
- VS Code, Python, pip, virtual environment (venv), Git, Postman

## High-Level Architecture
The application follows a client-server architecture:
- **React Frontend**: Handles user interactions, state management, and API requests.
- **Flask Backend**: Exposes RESTful APIs, processes requests, interacts with the TTS service, and serves audio files.
- **TTS Service**: (To be determined) Converts text to audio streams.

## Development Phases
1. **Foundation**: Project structure, documentation, and setup (Current Phase).
2. **Backend Development**: Flask API setup, TTS provider integration, error handling.
3. **Frontend Development**: React application UI, state management, API integration.
4. **Integration & Refinement**: End-to-end testing, UI polish, and performance optimization.

## Future API Endpoints
- `POST /api/tts`: Generate speech from text.
- `GET /api/voices`: Retrieve available voices.
- `GET /api/health`: Check backend health status.

## Security Considerations
- Never expose TTS API keys in the React frontend.
- Validate all user input on both frontend and backend.
- Enforce maximum text length constraints.
- Implement rate limiting to prevent abuse.
- Enforce HTTPS in production environments.
- Avoid permanent audio storage unless explicitly required.
- Configure Cross-Origin Resource Sharing (CORS) correctly.
- Sanitize data where necessary and never trust frontend data.

## Testing Expectations
- Unit and integration testing for Flask routes and services.
- Component testing for React UI elements.
- End-to-end testing for critical user flows (e.g., text to audio playback).

## Deployment Targets
- To be determined (e.g., Heroku, AWS, Vercel, etc.).
