# Pronounce.AI – AI Pronunciation Assessment Backend

This directory houses the backend server for the Pronounce.AI application. It handles audio validation, file ingestion limits, and routes payloads to Sarvam AI's speech services.

---

## Technical Stack
- **Runtime:** Node.js (v20+)
- **Server Framework:** Express.js
- **Upload Parser:** Multer
- **Audio Analyzer:** `music-metadata` (pure-JS parser)
- **HTTP Client:** Axios
- **Security & Logs:** Helmet, CORS, Morgan

---

## Directory Schema
```text
server/
├── src/
│   ├── config/
│   │     env.js         # Env variables parsing and assertions
│   │     sarvam.js      # Sarvam AI STT & LLM endpoint models mapping
│   │
│   ├── controllers/
│   │     uploadController.js   # Handles validation (30–45s bounds)
│   │     analysisController.js # Pipelines STT and LLM, cleans up files
│   │
│   ├── routes/
│   │     uploadRoutes.js       # Ingestion & evaluation routing
│   │
│   ├── middleware/
│   │     multer.js       # Disk storage settings & 20MB file filter
│   │     errorHandler.js # Catches errors and sweeps disk
│   │
│   ├── services/
│   │     sarvamSTT.js    # Sarvam Speech-to-Text API connector
│   │     sarvamLLM.js    # Sarvam Chat Completion JSON grader
│   │
│   ├── utils/
│   │     deleteFile.js   # Disk cleaner wrapper using fs/promises
│   │
│   ├── uploads/          # Temporary audio file repository
│   │
│   ├── app.js            # Express app assembly & base middleware
│   └── server.js         # Port listener binder
│
├── package.json
└── .env
```

---

## Inception & Configuration

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   Create a `.env` file in the `server/` root directory (template provided):
   ```ini
   PORT=5000
   SARVAM_API_KEY=your_sarvam_api_subscription_key
   NODE_ENV=development
   ```
   *Note: If no `SARVAM_API_KEY` is present, the server automatically defaults to high-fidelity simulated transcription and grading outputs for local development verification.*

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## API Documentation

### 1. Upload Ingestion
* **Endpoint:** `POST /api/upload`
* **Content-Type:** `multipart/form-data`
* **Form Field:** `file` (Supports `.mp3`, `.wav`, `.m4a`)
* **Limits:** Max Size: `20 MB`, Duration Constraint: `30 to 45 seconds`.
* **Testing with `curl`:**
  ```bash
  curl -X POST -F "file=@/path/to/vocal_clip.mp3" http://localhost:5000/api/upload
  ```
* **Success Response:**
  ```json
  {
    "success": true,
    "fileId": "uuid-v4-string",
    "filename": "original_filename.mp3",
    "duration": 34.5,
    "data": {
      "fileId": "uuid-v4-string",
      "filename": "original_filename.mp3",
      "duration": 34.5,
      "path": "server/src/uploads/uuid-v4-string.mp3"
    }
  }
  ```

### 2. Speech Analysis Pipeline
* **Endpoint:** `POST /api/analyze`
* **Content-Type:** `application/json`
* **Request Body:**
  ```json
  {
    "fileId": "uuid-v4-string"
  }
  ```
* **Testing with `curl`:**
  ```bash
  curl -X POST -H "Content-Type: application/json" -d "{\"fileId\":\"uuid-v4-string\"}" http://localhost:5000/api/analyze
  ```
* **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "transcription": "The pronunciation of this complex algorithm requires a careful evaluation of its architecture.",
      "language": "en-IN",
      "timestamps": [],
      "overallScore": 89,
      "pronunciation": 87,
      "fluency": 92,
      "clarity": 85,
      "summary": "Overall, your fluency is exceptional...",
      "mistakes": [
        {
          "word": "algorithm",
          "issue": "Voiced 'th' sound deviation",
          "severity": "error",
          "suggestion": "Pronounce the 'th' as a voiceless dental fricative..."
        }
      ]
    }
  }
  ```
  *(Note: The uploaded clip is automatically deleted from disk immediately upon completion of this analysis).*
