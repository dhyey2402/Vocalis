# Project Structure

The repository is organized into frontend and backend directories, ensuring a clean separation of concerns.

```text
text-to-speech/
├── frontend/
│   ├── src/
│   └── package.json
├── backend/
│   ├── app.py
│   ├── routes/
│   │   └── tts_routes.py
│   ├── services/
│   │   └── tts_service.py
│   ├── utils/
│   └── generated_audio/
├── requirements.txt
├── .env
└── README.md
```

## Directory Details

### `frontend/`
Contains the React.js application.
- `src/`: Holds the React source code, components, styles (Tailwind), and utilities.
- `package.json`: Defines frontend dependencies and npm scripts.

### `backend/`
Contains the Flask Python application.
- `app.py`: The main application entry point, setting up Flask, configuration, and registering routes.
- `routes/`: Contains controllers for different API endpoints.
  - `tts_routes.py`: Defines the `/api/tts`, `/api/voices`, and `/api/health` endpoints.
- `services/`: Contains business logic and external service integrations.
  - `tts_service.py`: Handles the actual communication with the chosen third-party TTS provider.
- `utils/`: Helper functions, constants, and shared utilities (e.g., file management, validation helpers).
- `generated_audio/`: A temporary directory for storing generated audio files before they are served to the frontend or cleaned up.

### Root Files
- `requirements.txt`: Python dependencies for the Flask backend.
- `.env`: Environment variables (e.g., TTS API keys, Flask secret keys, configuration settings). This file must be excluded from version control.
- `README.md`: The main project overview and documentation.
