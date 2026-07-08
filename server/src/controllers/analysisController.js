import path from 'path';
import fs from 'fs/promises';
import { transcribeAudio } from '../services/sarvamSTT.js';
import { evaluatePronunciation } from '../services/sarvamLLM.js';
import { deleteFile } from '../utils/deleteFile.js';

/**
 * Coordinates Speech-to-Text and Pronunciation evaluation pipeline.
 * Cleanly sweeps processed temporary audio files from disk.
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

    // Step 1: Execute Speech-to-Text
    console.log(`[Analysis Pipeline]: Running STT for path: ${targetFilePath}`);
    const sttResult = await transcribeAudio(targetFilePath);

    if (!sttResult.transcript || sttResult.transcript.trim() === '') {
      throw new Error('Vocal recording resulted in an empty transcript. Unable to calibrate accents.');
    }

    // Step 2: Evaluate Articulation using LLM
    console.log(`[Analysis Pipeline]: Evaluating transcription accuracy: "${sttResult.transcript}"`);
    const evaluation = await evaluatePronunciation(sttResult.transcript);

    // Step 3: Always delete the temporary file on success
    await deleteFile(targetFilePath);

    return res.status(200).json({
      success: true,
      data: {
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
      }
    });

  } catch (error) {
    // Clean up temporary file from disk on failure
    if (targetFilePath) {
      await deleteFile(targetFilePath);
    }
    next(error);
  }
};
