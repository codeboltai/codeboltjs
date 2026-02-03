# Speech Generation (Text-to-Speech)

Convert text to natural-sounding speech using a unified API across providers.

## Overview

Multillm provides **consistent speech synthesis** with the same interface. Switch providers by changing one parameter.

### Supported Providers

| Provider | Models | Voices | Formats |
|----------|---------|---------|----------|
| OpenAI | tts-1, tts-1-hd | alloy, echo, fable, onyx, nova, shimmer | mp3, opus, aac, flac, wav, pcm |

## Quick Start

```typescript
import Multillm from '@arrowai/multillm';

const llm = new Multillm('openai', 'tts-1', null, process.env.OPENAI_API_KEY);

const response = await llm.createSpeech({
  input: 'Hello, world! How are you today?',
  voice: 'alloy'
});

console.log(response.contentType);  // 'audio/mpeg'
console.log(response.audio);       // ArrayBuffer

// Save to file
import fs from 'fs';
fs.writeFileSync('speech.mp3', Buffer.from(response.audio));
```

## API Reference

### `createSpeech(options)`

Convert text to speech audio.

```typescript
interface SpeechOptions {
  input: string;                                          // Required, max 4096 characters
  model?: 'tts-1' | 'tts-1-hd';                      // Model selection
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
  speed?: number;                                          // Speed (0.25-4.0)
}

interface SpeechResponse {
  audio: ArrayBuffer;      // Audio data
  contentType: string;      // MIME type (e.g., 'audio/mpeg')
}
```

## Voice Selection

Available voices with characteristics:

| Voice | Gender | Accent | Description | Best For |
|-------|---------|---------|-------------|-----------|
| alloy | Neutral | American | Versatile, natural | General use |
| echo | Male | American | Warm, friendly | Narration, stories |
| fable | Female | British | Expressive, clear | Audiobooks |
| onyx | Male | American | Deep, authoritative | News, presentations |
| nova | Female | American | Clear, bright | Assistants, tutorials |
| shimmer | Female | American | Bright, expressive | Conversational AI |

```typescript
const text = 'Welcome to our application. Here is your personalized greeting.';

// Try different voices
const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

for (const voice of voices) {
  const response = await llm.createSpeech({
    input: text,
    voice: voice as any
  });
  
  fs.writeFileSync(`speech-${voice}.mp3`, Buffer.from(response.audio));
  console.log(`Created speech-${voice}.mp3`);
}
```

## Audio Formats

Different formats for different use cases:

```typescript
const text = 'This is a test of audio formats.';

// MP3 - Best compatibility (default)
const mp3 = await llm.createSpeech({
  input: text,
  voice: 'alloy',
  response_format: 'mp3'
});
// Output: audio/mpeg

// OPUS - Better quality, smaller size
const opus = await llm.createSpeech({
  input: text,
  voice: 'alloy',
  response_format: 'opus'
});
// Output: audio/opus

// WAV - Uncompressed, best editing
const wav = await llm.createSpeech({
  input: text,
  voice: 'alloy',
  response_format: 'wav'
});
// Output: audio/wav

// FLAC - Lossless compression
const flac = await llm.createSpeech({
  input: text,
  voice: 'alloy',
  response_format: 'flac'
});
// Output: audio/flac
```

## Speed Control

Adjust speech speed from 0.25 (very slow) to 4.0 (very fast):

```typescript
const text = 'This demonstrates different speech speeds.';

const speeds = [0.5, 1.0, 1.5, 2.0];

for (const speed of speeds) {
  const response = await llm.createSpeech({
    input: text,
    voice: 'alloy',
    speed
  });
  
  fs.writeFileSync(`speech-speed-${speed}.mp3`, Buffer.from(response.audio));
  console.log(`Created speed-${speed}.mp3`);
}
```

## High Quality (tts-1-hd)

Use the HD model for premium quality:

```typescript
const response = await llm.createSpeech({
  input: 'Welcome to our premium service.',
  voice: 'nova',
  model: 'tts-1-hd',  // Higher quality
  response_format: 'wav'  // Lossless for best quality
});

fs.writeFileSync('premium-speech.wav', Buffer.from(response.audio));
```

**Use Cases:**
- Audiobook production
- High-end applications
- Brand-critical content

**Considerations:**
- Slower generation
- Higher cost
- Larger file sizes

## Long Text Handling

Split long text into segments:

```typescript
async function speakLongText(text: string, llm: any) {
  const maxLength = 4000;  // Leave margin
  const segments = [];
  
  for (let i = 0; i < text.length; i += maxLength) {
    segments.push(text.slice(i, i + maxLength));
  }
  
  const audioSegments = [];
  for (const segment of segments) {
    const response = await llm.createSpeech({
      input: segment,
      voice: 'alloy'
    });
    audioSegments.push(response.audio);
  }
  
  // Concatenate audio segments
  // (Use audio library like ffmpeg or wavefile)
  return audioSegments;
}
```

## Multi-Language Support

Specify language in text for correct pronunciation:

```typescript
const multilingualContent = [
  { text: 'Hello, welcome to our service!', language: 'English' },
  { text: '¡Hola, bienvenido a nuestro servicio!', language: 'Spanish' },
  { text: 'Bonjour, bienvenue sur notre service!', language: 'French' },
  { text: '欢迎来到我们的服务！', language: 'Chinese' },
  { text: 'お使いいただきありがとうございます', language: 'Japanese' }
];

for (const { text, language } of multilingualContent) {
  const response = await llm.createSpeech({
    input: text,
    voice: 'alloy'  // Best for multilingual content
  });
  
  fs.writeFileSync(`speech-${language}.mp3`, Buffer.from(response.audio));
}
```

## Use Cases

### 1. Accessibility

```typescript
async function generateAccessibilityText(content: string) {
  const llm = new Multillm('openai', 'tts-1', null, process.env.OPENAI_API_KEY);
  
  const response = await llm.createSpeech({
    input: content,
    voice: 'nova',  // Clear, natural
    response_format: 'mp3'  // Best browser support
  });
  
  return response.audio;
}

// In web application
function playAccessibilityAudio(audio: ArrayBuffer) {
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(audio);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
}
```

### 2. Audiobook Production

```typescript
async function generateChapter(
  chapterText: string,
  narrator: 'fable' | 'onyx' | 'nova'
) {
  const llm = new Multillm('openai', 'tts-1-hd', null, process.env.OPENAI_API_KEY);
  
  const response = await llm.createSpeech({
    input: chapterText,
    voice: narrator,
    model: 'tts-1-hd',
    speed: 0.95  // Slightly slower for narration
  });
  
  return response.audio;
}

// Usage
const chapterAudio = await generateChapter(
  'Chapter 1: The Beginning...',
  'fable'  // British accent for classic feel
);
```

### 3. Voice Assistant

```typescript
class VoiceAssistant {
  private llm: any;
  private voice: string;
  
  constructor(apiKey: string, voice: string = 'alloy') {
    this.llm = new Multillm('openai', 'tts-1', null, apiKey);
    this.voice = voice;
  }
  
  async speak(text: string) {
    const response = await this.llm.createSpeech({
      input: text,
      voice: this.voice as any,
      response_format: 'mp3'
    });
    
    return response.audio;
  }
  
  async speakGreeting(userName: string) {
    const greetings = {
      alloy: `Hi ${userName}, how can I help you today?`,
      echo: `Hello ${userName}, good to see you!`,
      fable: `Greetings ${userName}, what can I assist with?`,
      onyx: `Welcome ${userName}, how may I help?`,
      nova: `Hi there ${userName}, what do you need?`,
      shimmer: `Hello ${userName}, how can I be of service?`
    };
    
    return this.speak(greetings[this.voice] || greetings.alloy);
  }
  
  setVoice(voice: string) {
    this.voice = voice;
  }
}

// Usage
const assistant = new VoiceAssistant(process.env.OPENAI_API_KEY, 'nova');
const audio = await assistant.speakGreeting('Alice');
```

### 4. Notification Audio

```typescript
async function generateNotificationSound() {
  const llm = new Multillm('openai', 'tts-1', null, process.env.OPENAI_API_KEY);
  
  const response = await llm.createSpeech({
    input: 'You have a new message',
    voice: 'nova',
    speed: 1.2  // Faster for notifications
  });
  
  return response.audio;
}
```

### 5. E-Learning Content

```typescript
async function generateLesson(
  lessonText: string,
  narrator: string
) {
  const llm = new Multillm('openai', 'tts-1', null, process.env.OPENAI_API_KEY);
  
  // Break into sentences for better pacing
  const sentences = lessonText.split('. ');
  let fullAudio = [];
  
  for (const sentence of sentences) {
    if (sentence.trim()) {
      const response = await llm.createSpeech({
        input: sentence.trim() + '.',
        voice: narrator as any,
        speed: 0.9  // Slower for educational content
      });
      fullAudio.push(response.audio);
    }
  }
  
  return fullAudio;
}

// Usage
const lessonAudio = await generateLesson(
  'Photosynthesis is the process by which plants convert sunlight into energy.',
  'fable'  // British academic voice
);
```

### 6. Dynamic Voice Selection

```typescript
interface VoiceProfile {
  voice: string;
  speed: number;
  model: 'tts-1' | 'tts-1-hd';
}

const voiceProfiles: Record<string, VoiceProfile> = {
  'calm': { voice: 'shimmer', speed: 0.85, model: 'tts-1' },
  'energetic': { voice: 'nova', speed: 1.1, model: 'tts-1' },
  'professional': { voice: 'onyx', speed: 1.0, model: 'tts-1-hd' },
  'friendly': { voice: 'echo', speed: 0.95, model: 'tts-1' },
  'storyteller': { voice: 'fable', speed: 0.9, model: 'tts-1-hd' }
};

async function generateWithProfile(text: string, profile: string) {
  const llm = new Multillm('openai', 'tts-1', null, process.env.OPENAI_API_KEY);
  const config = voiceProfiles[profile] || voiceProfiles.calm;
  
  const response = await llm.createSpeech({
    input: text,
    voice: config.voice as any,
    speed: config.speed,
    model: config.model
  });
  
  return response.audio;
}

// Usage
const calmAudio = await generateWithProfile('Welcome to the relaxation guide.', 'calm');
const energeticAudio = await generateWithProfile('Let is get started!', 'energetic');
```

## Web Integration

### HTML5 Audio

```typescript
async function playSpeech(text: string) {
  const llm = new Multillm('openai', 'tts-1', null, process.env.OPENAI_API_KEY);
  const response = await llm.createSpeech({
    input: text,
    voice: 'alloy'
  });
  
  const blob = new Blob([response.audio], { type: response.contentType });
  const audioUrl = URL.createObjectURL(blob);
  
  const audio = new Audio(audioUrl);
  audio.play();
}
```

### React Component

```typescript
import { useState } from 'react';

function SpeechPlayer({ text, voice = 'alloy' }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const generateSpeech = async () => {
    setLoading(true);
    
    try {
      const llm = new Multillm('openai', 'tts-1', null, process.env.OPENAI_API_KEY);
      const response = await llm.createSpeech({
        input: text,
        voice: voice as any,
        response_format: 'mp3'
      });
      
      const blob = new Blob([response.audio], { type: response.contentType });
      setAudioUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Speech generation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <p>{text}</p>
      <button onClick={generateSpeech} disabled={loading}>
        {loading ? 'Generating...' : 'Play Speech'}
      </button>
      {audioUrl && <audio src={audioUrl} controls />}
    </div>
  );
}
```

## Best Practices

1. **Voice Selection**: Choose voice appropriate to content type
2. **Speed Control**: 0.9-1.0 for most use cases
3. **Format Selection**: MP3 for web, WAV for editing, FLAC for archival
4. **Text Preparation**: Add punctuation for natural pauses
5. **Length Limits**: Split text longer than 4000 characters
6. **Quality vs Cost**: Use tts-1-hd only when necessary
7. **Caching**: Cache frequently used phrases
8. **Testing**: Test with different voices for best fit

## Error Handling

```typescript
try {
  const response = await llm.createSpeech({
    input: textToSpeak,
    voice: 'alloy'
  });
} catch (error) {
  if (error.message.includes('character_limit')) {
    console.error('Text too long, split into smaller chunks');
  } else if (error.message.includes('rate_limit')) {
    console.error('Rate limited, retry with backoff');
  } else if (error.message.includes('invalid_voice')) {
    console.error('Invalid voice specified');
  }
}
```

## Performance Tips

1. **Batch Processing**: Generate multiple related speeches in parallel
2. **Pre-generate**: Create audio for common phrases in advance
3. **Format Choice**: Use OPUS for smaller file sizes
4. **CDN**: Host generated audio on CDN for faster loading
5. **Compression**: Use appropriate format for use case

```typescript
// Bad: Sequential generation
const audio1 = await llm.createSpeech({ input: 'Hello' });
const audio2 = await llm.createSpeech({ input: 'World' });
const audio3 = await llm.createSpeech({ input: 'Goodbye' });

// Good: Parallel generation
const [audio1, audio2, audio3] = await Promise.all([
  llm.createSpeech({ input: 'Hello' }),
  llm.createSpeech({ input: 'World' }),
  llm.createSpeech({ input: 'Goodbye' })
]);
```
