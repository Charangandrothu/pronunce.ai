import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';
import * as mm from 'music-metadata';
import { SARVAM_API_KEY } from '../config/env.js';
import { SARVAM_STT_ENDPOINT, SARVAM_STT_MODEL } from '../config/sarvam.js';

// ── Setup fluent-ffmpeg with bundled binary (no system ffmpeg required) ────────
const require = createRequire(import.meta.url);
let ffmpegPath;
let ffmpeg;
try {
  ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  const { default: _ffmpeg } = await import('fluent-ffmpeg');
  _ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg = _ffmpeg;
  console.log('[STT Service]: ffmpeg ready at', ffmpegPath);
} catch (e) {
  console.warn('[STT Service]: fluent-ffmpeg not available:', e.message);
  ffmpeg = null;
}

/**
 * Slices a portion of an audio file using fluent-ffmpeg.
 * Re-encodes the segment to ensure valid headers.
 */
const sliceAudio = (inputPath, outputPath, startTime, duration) => {
  return new Promise((resolve, reject) => {
    if (!ffmpeg) {
      reject(new Error('ffmpeg is not configured'));
      return;
    }
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(outputPath)
      .on('end', () => {
        console.log(`[STT Service]: Sliced chunk ${path.basename(outputPath)} (${startTime}s to ${startTime + duration}s)`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error(`[STT Service]: Slicing failed for ${path.basename(outputPath)}:`, err.message);
        reject(err);
      })
      .run();
  });
};

/**
 * Splits audio into chunks of max 25s.
 * Because input is restricted to 30-45s, this split will always result in exactly 2 chunks.
 */
const splitAudio = async (inputPath) => {
  if (!ffmpeg) {
    console.warn('[STT Service]: ffmpeg not available, skipping split.');
    return [inputPath];
  }

  try {
    const metadata = await mm.parseFile(inputPath);
    const duration = metadata.format.duration;

    if (duration === undefined) {
      console.warn('[STT Service]: Could not parse audio duration, attempting direct transmission.');
      return [inputPath];
    }

    console.log(`[STT Service]: Input file duration is ${duration.toFixed(2)}s`);

    // If duration is safely within Sarvam's 30s limit, don't split
    if (duration <= 28) {
      return [inputPath];
    }

    const ext = path.extname(inputPath).toLowerCase() || '.mp3';
    const tmpDir = os.tmpdir();
    const baseName = `stt_chunk_${Date.now()}`;
    const chunk1Path = path.join(tmpDir, `${baseName}_001${ext}`);
    const chunk2Path = path.join(tmpDir, `${baseName}_002${ext}`);

    const half = duration / 2;

    console.log(`[STT Service]: Splitting ${duration.toFixed(2)}s audio into two chunks of ${half.toFixed(2)}s`);

    await Promise.all([
      sliceAudio(inputPath, chunk1Path, 0, half),
      sliceAudio(inputPath, chunk2Path, half, half + 2) // add small buffer for overlap
    ]);

    return [chunk1Path, chunk2Path];
  } catch (err) {
    console.warn('[STT Service]: Audio analysis/splitting failed, falling back to full file:', err.message);
    return [inputPath];
  }
};

/**
 * Sends a single chunk (≤30s) to Sarvam STT and returns the transcript string.
 */
const transcribeChunk = async (chunkPath) => {
  const ext = path.extname(chunkPath).toLowerCase();
  const mimeTypes = { '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg' };
  const mimeType = mimeTypes[ext] || 'audio/mpeg';

  const buffer = await fs.readFile(chunkPath);
  const blob = new Blob([buffer], { type: mimeType });
  const formData = new FormData();
  formData.append('file', blob, path.basename(chunkPath));
  formData.append('model', SARVAM_STT_MODEL);

  const response = await axios.post(SARVAM_STT_ENDPOINT, formData, {
    headers: { 'api-subscription-key': SARVAM_API_KEY }
  });

  return (response.data?.transcript || '').trim();
};

/**
 * Main STT entry point.
 * Splits the audio into ≤25s chunks, transcribes each, concatenates the result.
 * @param {string} filePath  Absolute path to the uploaded audio file
 */
export const transcribeAudio = async (filePath) => {
  if (!SARVAM_API_KEY) {
    console.log('[STT Service]: No API key — returning placeholder.');
    return { transcript: _placeholder(), language: 'en-IN', timestamps: [] };
  }

  let chunks = [];
  try {
    console.log('[STT Service]: Preparing audio chunks for STT...');
    chunks = await splitAudio(filePath);

    const parts = [];
    for (const chunk of chunks) {
      try {
        const text = await transcribeChunk(chunk);
        console.log(`[STT Service]: Chunk "${path.basename(chunk)}" → "${text}"`);
        if (text) parts.push(text);
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        console.warn(`[STT Service]: Chunk ${path.basename(chunk)} failed: ${msg}`);
      } finally {
        // Clean up temp chunk (but never the original upload)
        if (chunk !== filePath) {
          await fs.unlink(chunk).catch(() => {});
          console.log(`[STT Service]: Deleted temporary chunk ${path.basename(chunk)}`);
        }
      }
    }

    const transcript = parts.join(' ').trim();
    if (!transcript) throw new Error('All chunks returned empty transcripts.');

    console.log(`[STT Service]: Final transcript: "${transcript}"`);
    return { transcript, language: 'en-IN', timestamps: [] };

  } catch (err) {
    // Clean up remaining chunks
    for (const c of chunks) {
      if (c !== filePath) await fs.unlink(c).catch(() => {});
    }
    const msg = err.response?.data?.error?.message || err.message;
    console.error('[STT Service Error]:', msg);
    console.warn('[STT Service]: STT failed — returning placeholder for LLM.');
    return { transcript: _placeholder(), language: 'en-IN', timestamps: [] };
  }
};

const _placeholder = () =>
  'The speaker talked about an interesting topic with some complex words and sentences.';
