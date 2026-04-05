# Zephyr AI Integration Setup Guide

## Overview
The Zephyr app now integrates with **Hugging Face's MIT AudioSet Audio Classification Model** to analyze cough and breathing patterns from recorded audio.

## Setup Instructions

### 1. Get Your Hugging Face API Token

1. Go to [https://huggingface.co/join](https://huggingface.co/join) and create a free account
2. Once signed up, navigate to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Click **"New token"** and create an API token
4. Copy the token (it starts with `hf_`)

### 2. Add Token to Your Environment

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and replace `your_hugging_face_token_here` with your actual token:

```env
HUGGING_FACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT:** Never commit `.env.local` to git. It's already in `.gitignore`.

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## How It Works

### Frontend Flow
1. User uploads a Mantoux reaction photo
2. User records a 5-second cough sample
3. User clicks "Analyze Patient"
4. Frontend sends audio blob to `/api/analyze`

### Backend Processing (`/api/analyze`)
1. Receives audio file from frontend
2. Sends to Hugging Face MIT AudioSet model
3. AI returns probabilities for different audio types (cough, breathing, etc.)
4. Backend returns structured results to frontend

### Results Interpretation
The API response contains an array like:
```json
[
  { "label": "Cough", "score": 0.89 },
  { "label": "Breathing", "score": 0.45 },
  { "label": "Speech", "score": 0.12 }
]
```

**Risk Assessment Logic:**
- **Cough confidence > 60%** → `HIGH RISK` ⚠️
- **Breathing/Wheeze > 50%** → `MEDIUM RISK` ⚠️
- **Otherwise** → `LOW RISK` ✅

## API Endpoint Reference

### POST `/api/analyze`

**Request:**
```
Content-Type: multipart/form-data
Body: FormData with 'audio' field containing Blob
```

**Response (Success):**
```json
{
  "aiData": [
    { "label": "Cough", "score": 0.89 },
    { "label": "Breathing", "score": 0.45 }
  ]
}
```

**Response (Error):**
```json
{
  "error": "AI service not configured",
  "details": "Missing HUGGING_FACE_TOKEN"
}
```

## Troubleshooting

### "AI service not configured"
- Ensure `.env.local` file exists in the project root
- Check that `HUGGING_FACE_TOKEN` is set correctly (no typos)
- Restart the dev server after adding the token

### "AI service error"
- Your Hugging Face token may have expired or been invalidated
- Generate a new token at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- Update `.env.local` with the new token

### No audio file submitted
- Ensure audio is recorded before clicking "Analyze Patient"
- Check browser console for error messages
- Verify microphone permissions are granted

### "Connection refused" or timeout
- Check internet connectivity
- Hugging Face API might be temporarily unavailable
- Try again in a few seconds

## Advanced: Using a Different Model

To use a different audio model, modify the URL in `app/api/analyze/route.ts`:

```typescript
// Current model (MIT AudioSet)
const hfResponse = await fetch(
  "https://api-inference.huggingface.co/models/MIT/ast-finetuned-audioset-10-10-0.4593",
  // ...
);

// Alternative models:
// "https://api-inference.huggingface.co/models/speechbrain/wav2vec2-conformer-conformer-large-lm-w2v2-giga"
// "https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
```

## Security Notes

- ✅ API token is stored server-side only (never exposed to frontend)
- ✅ Audio files are not persisted; they're processed and discarded
- ✅ HTTPS required in production
- ✅ Rate limiting recommended for production deployment

## Production Deployment

For production (Vercel, Railway, etc.):

1. Set the environment variable in your hosting platform's dashboard:
   - **Variable name:** `HUGGING_FACE_TOKEN`
   - **Value:** Your Hugging Face token

2. Deploy as usual:
   ```bash
   git push origin main  # or your deployment branch
   ```

The production build will automatically pick up the token from the hosting platform's environment variables.
