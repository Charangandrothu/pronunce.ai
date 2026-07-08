import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { transcribeAudio } from '../services/sarvamSTT.js';
import { evaluatePronunciation } from '../services/sarvamLLM.js';
import { deleteFile } from '../utils/deleteFile.js';

const CACHE_FILE = path.resolve('src/uploads/analysis_cache.json');

/**
 * Reads the persistent analysis cache file.
 */
const readCache = async () => {
  try {
    const content = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
};

/**
 * Writes to the persistent analysis cache file.
 */
const writeCache = async (cache) => {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Cache Error]: Failed to save cache file:', err.message);
  }
};

/**
 * Computes SHA-256 hash of a file's binary content.
 */
const getFileHash = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Coordinates Speech-to-Text and Pronunciation evaluation pipeline.
 * Implements persistent binary hashing cache for 100% deterministic re-uploads.
 */
export const handleAnalysis = async (req, res, next) => {
  const { fileId, filename } = req.body;

  if (!fileId && !filename) {
    return res.status(400).json({
      success: false,
      message: 'Missing identifier. Please provide a fileId or filename in the request body.'
    });
  }

  const uploadDir = path.resolve('src/uploads');
  let targetFilePath = null;

  try {
    if (filename) {
      targetFilePath = path.join(uploadDir, filename);
    } else {
      // Find the file matching the fileId UUID string prefix
      const files = await fs.readdir(uploadDir);
      const matchedFile = files.find(f => f.startsWith(fileId));
      if (!matchedFile) {
        return res.status(404).json({
          success: false,
          message: `The speech sample for file ID "${fileId}" was not found or has already been processed.`
        });
      }
      targetFilePath = path.join(uploadDir, matchedFile);
    }

    // Double-check file existence
    try {
      await fs.access(targetFilePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'The requested audio file is missing from the temporary repository.'
      });
    }

    // Compute binary hash to check persistent cache
    const fileHash = await getFileHash(targetFilePath);
    console.log(`[Analysis Pipeline]: File SHA-256 hash: ${fileHash}`);

    const cache = await readCache();
    if (cache[fileHash]) {
      console.log('[Analysis Pipeline]: Cache hit! Returning identical cached evaluation metrics.');
      
      // Clean up the uploaded temporary file (it is a duplicate)
      await deleteFile(targetFilePath);

      return res.status(200).json({
        success: true,
        data: cache[fileHash]
      });
    }

    // Step 1: Execute Speech-to-Text
    console.log(`[Analysis Pipeline]: Running STT for path: ${targetFilePath}`);
    const sttResult = await transcribeAudio(targetFilePath);

    if (!sttResult.transcript || sttResult.transcript.trim() === '') {
      throw new Error('Vocal recording resulted in an empty transcript. Unable to calibrate accents.');
    }

    // Step 2: Evaluate Articulation using LLM (Deterministic temperature: 0.0)
    console.log(`[Analysis Pipeline]: Evaluating transcription accuracy: "${sttResult.transcript}"`);
    const evaluation = await evaluatePronunciation(sttResult.transcript);

    // Step 3: Always delete the temporary file on success
    await deleteFile(targetFilePath);

    const resultData = {
      // Transcript (both keys for compatibility)
      transcript:    sttResult.transcript,
      transcription: sttResult.transcript,
      language:      sttResult.language,
      timestamps:    sttResult.timestamps,
      // Scores
      overallScore:  evaluation.overallScore  || 0,
      pronunciation: evaluation.pronunciation || 0,
      fluency:       evaluation.fluency       || 0,
      clarity:       evaluation.clarity       || 0,
      confidence:    evaluation.confidence    || 0,
      // Diagnostic content
      highlights:    evaluation.highlights    || [],
      mistakes:      evaluation.mistakes      || [],
      practiceWords: evaluation.practiceWords || [],
      summary:       evaluation.summary       || ''
    };

    // Save to persistent cache mapping SHA-256 hash to resultData
    cache[fileHash] = resultData;
    await writeCache(cache);
    console.log('[Analysis Pipeline]: Assessment saved to persistent cache.');

    return res.status(200).json({
      success: true,
      data: resultData
    });

  } catch (error) {
    // Clean up temporary file from disk on failure
    if (targetFilePath) {
      await deleteFile(targetFilePath);
    }
    next(error);
  }
};
