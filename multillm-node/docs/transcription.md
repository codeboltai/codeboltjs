# Audio Transcription (Speech-to-Text)

Convert audio files to text with timestamps using a unified API across providers.

## Overview

Multillm provides **consistent transcription** with the same interface. Switch providers by changing one parameter.

### Supported Providers

| Provider | Models | Languages | Features |
|----------|---------|------------|----------|
| OpenAI | whisper-1 | 50+ | Timestamps, SRT, VTT, verbose JSON |
| Groq | whisper-large-v3, etc. | 90+ | Fast, multilingual |

## Quick Start

```typescript
import Multillm from '@arrowai/multillm';
import fs from 'fs';

const llm = new Multillm('openai', 'whisper-1', null, process.env.OPENAI_API_KEY);

const response = await llm.createTranscription({
  audio: fs.readFileSync('recording.mp3')
});

console.log(response.text);
// Output: "Hello, how can I help you today?"
console.log(response.duration);  // Duration in seconds (if available)
```

## API Reference

### `createTranscription(options)`

Transcribe audio files to text.

```typescript
interface TranscriptionOptions {
  audio: File | Blob | ArrayBuffer | string;              // Required
  model?: string;                                     // Model name
  language?: string;                                   // ISO-639-1 code (e.g., 'en', 'es')
  prompt?: string;                                     // Guide transcription style
  response_format?: 'json' | 'text' | 'srt' | 'vtt' | 'verbose_json';
  temperature?: number;                                 // 0-1
  timestamp_granularities?: ('word' | 'segment')[];
}

interface TranscriptionResponse {
  text: string;                   // Transcribed text
  task?: string;                  // Always 'transcribe'
  language?: string;               // Detected language
  duration?: number;              // Audio duration in seconds
  words?: TranscriptionWord[];     // Word timestamps (verbose_json)
  segments?: TranscriptionSegment[]; // Segment timestamps (verbose_json)
}

interface TranscriptionWord {
  word: string;      // The word
  start: number;     // Start time in seconds
  end: number;       // End time in seconds
}

interface TranscriptionSegment {
  id: number;                    // Segment ID
  seek: number;                   // Position in file
  start: number;                  // Start time
  end: number;                    // End time
  text: string;                   // Transcribed text
  tokens: number[];                // Token timestamps
  temperature: number;             // Temperature used
  avg_logprob: number;            // Average log probability
  compression_ratio: number;        // Compression ratio
  no_speech_prob: number;         // Probability of no speech
}
```

## Basic Transcription

```typescript
import fs from 'fs';

const response = await llm.createTranscription({
  audio: fs.readFileSync('meeting.mp3'),
  model: 'whisper-1'
});

console.log('Transcription:', response.text);
console.log('Language:', response.language);
console.log('Duration:', response.duration, 'seconds');
```

## Language Specification

Specify language for better accuracy:

```typescript
const response = await llm.createTranscription({
  audio: audioFile,
  model: 'whisper-1',
  language: 'en'  // English
});

// Other language codes:
// 'es' - Spanish
// 'fr' - French
// 'de' - German
// 'ja' - Japanese
// 'ko' - Korean
// 'zh' - Chinese
```

**Supported Languages:** 50+ languages including all major languages.

## Prompt Guidance

Guide transcription style with a prompt:

```typescript
// Medical terminology
const medical = await llm.createTranscription({
  audio: medicalRecording,
  model: 'whisper-1',
  prompt: 'This is a medical dictation. Use medical terminology such as diagnosis, symptoms, treatment, medication.'
});

// Legal terminology
const legal = await llm.createTranscription({
  audio: legalDeposition,
  model: 'whisper-1',
  prompt: 'This is a legal deposition. Use legal terminology such as plaintiff, defendant, testimony, evidence, affidavit.'
});

// Meeting notes
const meeting = await llm.createTranscription({
  audio: meetingRecording,
  model: 'whisper-1',
  prompt: 'This is a business meeting. Include speaker names if possible, action items, and decisions made.'
});
```

## Response Formats

### JSON (default)

```typescript
const response = await llm.createTranscription({
  audio: audioFile,
  response_format: 'json'
});

console.log(response);
// Output:
// {
//   text: "The quick brown fox",
//   language: "en",
//   duration: 2.5
// }
```

### Text

```typescript
const response = await llm.createTranscription({
  audio: audioFile,
  response_format: 'text'
});

console.log(response.text);  // "The quick brown fox"
```

### SRT Subtitles

```typescript
const response = await llm.createTranscription({
  audio: audioFile,
  response_format: 'srt'
});

// response.text contains SRT format:
// 1
// 00:00:00,000 --> 00:00:02,500
// The quick brown fox

// 2
// 00:00:02,500 --> 00:00:05,000
// jumps over the lazy dog

// Save to file
fs.writeFileSync('captions.srt', response.text);
```

### VTT Subtitles

```typescript
const response = await llm.createTranscription({
  audio: file,
  response_format: 'vtt'
});

// response.text contains WebVTT format:
// WEBVTT
// 00:00:00.000 --> 00:00:02.500
// The quick brown fox

fs.writeFileSync('captions.vtt', response.text);
```

### Verbose JSON with Timestamps

```typescript
const response = await llm.createTranscription({
  audio: file,
  response_format: 'verbose_json',
  timestamp_granularities: ['word']
});

console.log(response.words);
// Output:
// [
//   { word: "The", start: 0.0, end: 0.2 },
//   { word: "quick", start: 0.2, end: 0.5 },
//   { word: "brown", start: 0.5, end: 0.8 },
//   { word: "fox", start: 0.8, end: 1.2 }
// ]

console.log(response.segments);
// Output:
// [
//   {
//     id: 0,
//     seek: 0,
//     start: 0.0,
//     end: 1.2,
//     text: "The quick brown fox",
//     ...
//   }
// ]
```

## Timestamp Granularities

Control timestamp precision:

```typescript
// Word-level timestamps
const wordLevel = await llm.createTranscription({
  audio: file,
  response_format: 'verbose_json',
  timestamp_granularities: ['word']
});

// Segment-level timestamps
const segmentLevel = await llm.createTranscription({
  audio: file,
  response_format: 'verbose_json',
  timestamp_granularities: ['segment']
});

// Both word and segment
const both = await llm.createTranscription({
  audio: file,
  response_format: 'verbose_json',
  timestamp_granularities: ['word', 'segment']
});
```

## Switching Providers

Same code works with different providers:

```typescript
const audioFile = fs.readFileSync('meeting.mp3');

// OpenAI Whisper
const openai = new Multillm('openai', 'whisper-1', null, process.env.OPENAI_API_KEY);
const openaiResult = await openai.createTranscription({
  audio: audioFile
});

// Groq Whisper (faster!)
const groq = new Multillm('groq', 'whisper-large-v3', null, process.env.GROQ_API_KEY);
const groqResult = await groq.createTranscription({
  audio: audioFile
});

// Same structure
console.log('OpenAI:', openaiResult.text);
console.log('Groq:', groqResult.text);
```

## Use Cases

### 1. Meeting Transcription

```typescript
async function transcribeMeeting(audioFile: Buffer) {
  const llm = new Multillm('openai', 'whisper-1', null, process.env.OPENAI_API_KEY);
  
  const response = await llm.createTranscription({
    audio: audioFile,
    prompt: 'This is a business meeting. Include action items and decisions.',
    language: 'en'
  });
  
  // Save transcript
  fs.writeFileSync('meeting-transcript.txt', response.text);
  
  // Generate summary with LLM
  const summaryLlm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);
  const summary = await summaryLlm.createCompletion({
    messages: [{
      role: 'system',
      content: 'You are a helpful assistant that creates meeting summaries with action items.'
    }, {
      role: 'user',
      content: `Create a summary of this meeting transcript:\n\n${response.text}`
    }]
  });
  
  return {
    transcript: response.text,
    summary: summary.choices[0].message.content
  };
}
```

### 2. Podcast Transcription

```typescript
async function transcribePodcast(audioFile: Buffer) {
  const llm = new Multillm('openai', 'whisper-1', null, process.env.OPENAI_API_KEY);
  
  const response = await llm.createTranscription({
    audio: audioFile,
    language: 'en',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment']
  });
  
  // Create transcript with timestamps
  let transcript = '';
  for (const segment of response.segments || []) {
    const startTime = formatTimestamp(segment.start);
    const endTime = formatTimestamp(segment.end);
    transcript += `[${startTime} - ${endTime}]\n${segment.text}\n\n`;
  }
  
  fs.writeFileSync('podcast-transcript.txt', transcript);
  
  return transcript;
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
```

### 3. Subtitle Generation

```typescript
async function generateSubtitles(
  videoFile: Buffer,
  format: 'srt' | 'vtt' = 'srt'
) {
  const llm = new Multillm('openai', 'whisper-1', null, process.env.OPENAI_API_KEY);
  
  const response = await llm.createTranscription({
    audio: videoFile,
    language: 'en',
    response_format: format
  });
  
  const extension = format === 'srt' ? '.srt' : '.vtt';
  fs.writeFileSync(`captions${extension}`, response.text);
  
  console.log(`Generated captions${extension}`);
  
  return response.text;
}

// Usage
const srt = await generateSubtitles(audioBuffer, 'srt');
const vtt = await generateSubtitles(audioBuffer, 'vtt');
```

### 4. Medical Dictation

```typescript
async function transcribeMedicalRecording(recording: Buffer) {
  const llm = new Multillm('openai', 'whisper-1', null, process.env.OPENAI_API_KEY);
  
  const response = await llm.createTranscription({
    audio: recording,
    prompt: 'Medical dictation. Use terminology such as: patient, diagnosis, symptoms, treatment, medication, dosage, allergy, vital signs.',
    language: 'en'
  });
  
  return {
    text: response.text,
    language: response.language,
    duration: response.duration
  };
}
```

### 5. Language Detection

```typescript
async function detectLanguage(audioFile: Buffer) {
  const llm = new Multillm('openai', 'whisper-1', null, process.env.OPENAI_API_KEY);
  
  const response = await llm.createTranscription({
    audio: audioFile
  });
  
  console.log('Detected language:', response.language);
  console.log('Confidence:', response.language ? 'High' : 'Low');
  
  return response.language;
}
```

### 6. Conversation Analysis

```typescript
async function analyzeConversation(audioFile: Buffer) {
  const llm = new Multillm('openai', 'whisper-1', null, process.env.OPENAI_API_KEY);
  
  const response = await llm.createTranscription({
    audio: audioFile,
    response_format: 'verbose_json',
    timestamp_granularities: ['word']
  });
  
  // Analyze speaking patterns
  const words = response.words || [];
  const totalDuration = response.duration || 0;
  const speakingTime = words.reduce((sum, word) => {
    return sum + (word.end - word.start);
  }, 0);
  
  const speakingRatio = (speakingTime / totalDuration) * 100;
  const wordsPerMinute = (words.length / totalDuration) * 60;
  
  return {
    transcript: response.text,
    wordCount: words.length,
    totalDuration,
    speakingTime,
    silenceTime: totalDuration - speakingTime,
    speakingRatio: `${speakingRatio.toFixed(1)}%`,
    wordsPerMinute: wordsPerMinute.toFixed(1)
  };
}
```

## Audio File Formats

Supported input formats:

| Format | Extension | Notes |
|--------|-----------|-------|
| MP3 | .mp3 | Best compatibility |
| WAV | .wav | Uncompressed, best quality |
| M4A | .m4a | Apple format |
| OGG | .ogg | Open source |
| FLAC | .flac | Lossless |

```typescript
// Different file formats
const formats = [
  'meeting.mp3',
  'interview.wav',
  'podcast.m4a'
];

for (const file of formats) {
  const response = await llm.createTranscription({
    audio: fs.readFileSync(file)
  });
  console.log(`${file}:`, response.text);
}
```

## Best Practices

1. **Audio Quality**: Use clear, noise-free recordings
2. **File Format**: WAV for best accuracy, MP3 for balance
3. **Language**: Specify language when known
4. **Prompts**: Use prompts to improve accuracy for specialized content
5. **Format Choice**: SRT/VTT for subtitles, verbose_json for analysis
6. **Batching**: Process multiple files in parallel
7. **Validation**: Verify transcriptions with spot checks

## Performance Optimization

```typescript
// Bad: Sequential processing
const results = [];
for (const file of audioFiles) {
  const result = await llm.createTranscription({ audio: file });
  results.push(result);
}

// Good: Parallel processing
const results = await Promise.all(
  audioFiles.map(file =>
    llm.createTranscription({ audio: file })
  )
);
```

## Error Handling

```typescript
try {
  const response = await llm.createTranscription({
    audio: audioFile
  });
} catch (error) {
  if (error.message.includes('file_too_large')) {
    console.error('Audio file too large (max 25MB)');
    // Compress or split audio
  } else if (error.message.includes('invalid_file_format')) {
    console.error('Unsupported audio format');
    // Convert to MP3/WAV
  } else if (error.message.includes('rate_limit')) {
    console.error('Rate limited, retrying...');
    // Implement retry with backoff
  } else if (error.message.includes('no_speech')) {
    console.error('No speech detected in audio');
    // Check audio file
  }
}
```

## Cost Optimization

1. **Shorter Audio**: Edit out silence and irrelevant content
2. **Groq Provider**: Faster, often cheaper for transcription
3. **Language Spec**: Reduces processing time
4. **Format Choice**: Smaller files process faster
5. **Caching**: Cache transcriptions of unchanged files

```typescript
// Fast transcription with Groq
const groqLlm = new Multillm('groq', 'whisper-large-v3', null, process.env.GROQ_API_KEY);

const response = await groqLlm.createTranscription({
  audio: audioFile,
  language: 'en'  // Speeds up processing
});
```
