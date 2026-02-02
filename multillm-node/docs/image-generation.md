# Image Generation

Generate images from text descriptions using a unified API across multiple providers.

## Overview

Multillm provides a **consistent image generation API**. Switch between providers by changing one line of code.

### Supported Providers

| Provider | Models | Max Size | Response Formats |
|----------|---------|-----------|-----------------|
| OpenAI | dall-e-3, dall-e-2 | 1792x1024 | URL, base64 |
| Replicate | SDXL, Flux, etc. | Varies | URL, base64 |

## Quick Start

```typescript
import Multillm from '@arrowai/multillm';

// Works with any supported provider
const llm = new Multillm('openai', 'dall-e-3', null, process.env.OPENAI_API_KEY);

const response = await llm.createImage({
  prompt: 'A futuristic cyberpunk city at night with neon lights'
});

console.log(response.data[0].url);
// Output: https://oaidalleapiprodscus.blob.core.windows.net/private/...
```

## API Reference

### `createImage(options)`

Generate images from text prompts.

```typescript
interface ImageGenerationOptions {
  prompt: string;                                      // Required
  model?: string;                                       // Model name
  n?: number;                                          // Number of images (1-10)
  size?: '256x256' | '512x512' | '1024x1024' |      // Image size
         '1792x1024' | '1024x1792' | string;
  quality?: 'standard' | 'hd';                          // DALL-E 3 only
  style?: 'vivid' | 'natural';                          // DALL-E 3 only
  response_format?: 'url' | 'b64_json';                 // Output format
  user?: string;                                        // User identifier (for abuse prevention)
}

interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;                    // URL (if response_format: 'url')
    b64_json?: string;              // Base64 JSON (if response_format: 'b64_json')
    revised_prompt?: string;           // Revised prompt (DALL-E 3)
  }>;
}
```

## Basic Image Generation

```typescript
const response = await llm.createImage({
  prompt: 'A serene mountain landscape with a lake at sunset',
  size: '1024x1024',
  n: 1
});

console.log('Image URL:', response.data[0].url);
console.log('Revised prompt:', response.data[0].revised_prompt);
```

## Multiple Images

Generate several variations at once:

```typescript
const response = await llm.createImage({
  prompt: 'A cute cat playing with a ball',
  size: '512x512',
  n: 4  // Generate 4 variations
});

response.data.forEach((image, index) => {
  console.log(`Image ${index + 1}:`, image.url);
});
```

## Image Sizes

Different sizes for different use cases:

```typescript
// Small - avatars, icons
const small = await llm.createImage({
  prompt: 'Simple logo',
  size: '256x256'
});

// Medium - previews
const medium = await llm.createImage({
  prompt: 'Product photo',
  size: '512x512'
});

// Large - high quality
const large = await llm.createImage({
  prompt: 'Detailed landscape',
  size: '1024x1024'
});

// Wide - banners
const wide = await llm.createImage({
  prompt: 'Panoramic view',
  size: '1792x1024'
});

// Portrait - profile images
const portrait = await llm.createImage({
  prompt: 'Portrait photo',
  size: '1024x1792'
});
```

## Quality and Style (OpenAI DALL-E 3)

```typescript
const response = await llm.createImage({
  prompt: 'A detailed oil painting of a forest',
  size: '1024x1024',
  quality: 'hd',      // Higher quality, more detail
  style: 'natural'    // More realistic look
});

// Options:
// quality: 'standard' (default, faster) | 'hd' (slower, better)
// style: 'vivid' (hyper-realistic) | 'natural' (realistic)
```

## Base64 Response

Get images as base64 strings for direct use:

```typescript
const response = await llm.createImage({
  prompt: 'A blue circle',
  size: '256x256',
  response_format: 'b64_json'
});

const base64Image = response.data[0].b64_json;

// Use in HTML
const imgElement = `<img src="data:image/png;base64,${base64Image}" />`;

// Or save to file
import fs from 'fs';
import path from 'path';
const buffer = Buffer.from(base64Image, 'base64');
fs.writeFileSync('output.png', buffer);
```

## Switching Providers

Same code works with different providers:

```typescript
const prompt = 'A steampunk airship flying over clouds';

// OpenAI DALL-E 3
const openai = new Multillm('openai', 'dall-e-3', null, process.env.OPENAI_API_KEY);
const dalleImages = await openai.createImage({ prompt });
console.log('DALL-E:', dalleImages.data[0].url);

// Replicate (same code!)
const replicate = new Multillm('replicate', null, null, process.env.REPLICATE_API_TOKEN);
const replicateImages = await replicate.createImage({
  prompt,
  model: 'stabilityai/sdxl'
});
console.log('Replicate:', replicateImages.data[0].url);
```

## Provider-Specific Models

### OpenAI

**DALL-E 3**
```typescript
const dalle3 = new Multillm('openai', 'dall-e-3', null, process.env.OPENAI_API_KEY);

const response = await dalle3.createImage({
  prompt: 'A futuristic cityscape',
  size: '1024x1024',
  quality: 'hd',
  style: 'vivid'
});
```

- Sizes: `1024x1024`, `1024x1792`, `1792x1024`
- Quality: `standard`, `hd`
- Style: `vivid`, `natural`
- Best for: High quality, detailed images

**DALL-E 2**
```typescript
const dalle2 = new Multillm('openai', 'dall-e-2', null, process.env.OPENAI_API_KEY);

const response = await dalle2.createImage({
  prompt: 'A cat',
  size: '512x512',
  n: 4  // DALL-E 2 supports up to 10 images
});
```

- Sizes: `256x256`, `512x512`
- Multiple images: Up to 10 per request
- Best for: Faster generation, multiple variations

### Replicate

```typescript
const replicate = new Multillm('replicate', null, null, process.env.REPLICATE_API_TOKEN);

const response = await replicate.createImage({
  prompt: 'A detailed fantasy dragon',
  model: 'stabilityai/sdxl'
});
```

- Models: `stabilityai/sdxl`, `black-forest-labs/flux`, etc.
- Custom models available
- Best for: Specialized styles, custom models

## Use Cases

### 1. Marketing Content

```typescript
async function generateMarketingImages(product: string) {
  const llm = new Multillm('openai', 'dall-e-3', null, process.env.OPENAI_API_KEY);
  
  const images = await Promise.all([
    llm.createImage({
      prompt: `Professional product shot of ${product}, white background, studio lighting`,
      size: '1024x1024',
      quality: 'hd'
    }),
    llm.createImage({
      prompt: `Lifestyle photo showing people using ${product}`,
      size: '1792x1024',
      quality: 'hd',
      style: 'natural'
    })
  ]);
  
  return images;
}
```

### 2. Social Media Content

```typescript
const socialSizes = [
  { size: '1080x1080', platform: 'Instagram' },
  { size: '1200x628', platform: 'Twitter' },
  { size: '1200x627', platform: 'Facebook' },
  { size: '1080x1920', platform: 'Instagram Story' }
];

async function createSocialPost(post: string) {
  const llm = new Multillm('openai', 'dall-e-3', null, process.env.OPENAI_API_KEY);
  
  const images = await Promise.all(
    socialSizes.map(({ size, platform }) =>
      llm.createImage({
        prompt: post,
        size: size as any,
        n: 1
      }).then(res => ({ platform, url: res.data[0].url }))
    )
  );
  
  return images;
}
```

### 3. Book Cover Design

```typescript
async function generateBookCover(
  title: string,
  genre: string,
  mood: string
) {
  const llm = new Multillm('openai', 'dall-e-3', null, process.env.OPENAI_API_KEY);
  
  const response = await llm.createImage({
    prompt: `Professional book cover design for "${title}". ${genre} genre. ${mood} mood. High quality, detailed, artistic style. No text.`,
    size: '1024x1792',  // Portrait aspect ratio for book covers
    quality: 'hd',
    style: 'natural'
  });
  
  return response.data[0].url;
}

// Usage
const coverUrl = await generateBookCover(
  'The Lost Chronicles',
  'Fantasy',
  'Mysterious and magical'
);
```

### 4. UI Assets

```typescript
const uiAssets = [
  { type: 'logo', prompt: 'Minimalist abstract logo, blue and white colors' },
  { type: 'icon', prompt: 'Simple settings icon, white background', size: '256x256' },
  { type: 'background', prompt: 'Gradient background, modern tech style' },
  { type: 'hero', prompt: 'Hero banner image with people using technology', size: '1792x1024' }
];

async function generateUIAssets() {
  const llm = new Multillm('openai', 'dall-e-3', null, process.env.OPENAI_API_KEY);
  
  const assets = await Promise.all(
    uiAssets.map(asset =>
      llm.createImage({
        prompt: asset.prompt,
        size: (asset.size || '1024x1024') as any,
        response_format: 'b64_json'
      }).then(res => ({
        type: asset.type,
        data: res.data[0].b64_json
      }))
    )
  );
  
  return assets;
}
```

## Prompt Engineering

Good prompts lead to better images:

### Be Specific

```typescript
// Vague
await llm.createImage({
  prompt: 'A cat'
});

// Better
await llm.createImage({
  prompt: 'A fluffy orange tabby cat sitting on a windowsill, afternoon sunlight, photorealistic, detailed fur texture'
});
```

### Style and Mood

```typescript
await llm.createImage({
  prompt: 'A mountain landscape, dramatic lighting, cinematic, 8k, ultra detailed, golden hour'
});
```

### Medium and Technique

```typescript
await llm.createImage({
  prompt: 'Portrait of a woman, oil painting style, impressionist, brush strokes visible, warm color palette'
});
```

### Composition

```typescript
await llm.createImage({
  prompt: 'Modern office interior, wide angle, leading lines, natural lighting, minimal furniture, plants in corner'
});
```

### Negative Prompts (Replicate)

```typescript
const replicate = new Multillm('replicate', null, null, process.env.REPLICATE_API_TOKEN);

await replicate.createImage({
  prompt: 'A beautiful forest',
  model: 'stabilityai/sdxl',
  // Replicate specific parameters
});
```

## Cost Optimization

1. **Size Selection**: Use smallest size that meets your needs
2. **DALL-E 2**: Faster and cheaper for simple images
3. **Batch Generation**: Generate multiple images in one call
4. **Caching**: Store generated images for reuse

```typescript
// Cost-effective for thumbnails
const thumbnail = await llm.createImage({
  prompt: description,
  size: '256x256',  // Much cheaper than 1024x1024
  model: 'dall-e-2'   // Cheaper than DALL-E 3
});

// High quality for hero images
const hero = await llm.createImage({
  prompt: description,
  size: '1792x1024',
  quality: 'hd',
  model: 'dall-e-3'
});
```

## Error Handling

```typescript
try {
  const response = await llm.createImage({
    prompt: 'Generate an image',
    size: '1024x1024'
  });
} catch (error) {
  if (error.message.includes('content_policy')) {
    console.error('Image rejected by content policy');
    // Retry with different prompt
  } else if (error.message.includes('rate_limit')) {
    console.error('Rate limited, retrying with backoff...');
    // Implement retry logic
  } else if (error.message.includes('invalid_size')) {
    console.error('Invalid image size');
    // Use valid size
  }
}
```

## Best Practices

1. **Prompt Details**: More specific prompts = better results
2. **Aspect Ratio**: Match image size to intended use
3. **Style Consistency**: Use similar style descriptions for related images
4. **Quality vs Cost**: Use `hd` only when necessary
5. **Testing**: Generate multiple variations and select best
6. **Post-Processing**: Consider manual adjustments for critical images
7. **Policy Compliance**: Avoid prohibited content in prompts

## Examples

### Real Estate Photos

```typescript
const propertyTypes = ['modern apartment', 'luxury house', 'cozy cottage', 'beach villa'];

const images = await Promise.all(
  propertyTypes.map(type =>
    llm.createImage({
      prompt: `Professional real estate photography of ${type}, bright natural lighting, inviting atmosphere, high resolution`,
      size: '1792x1024',
      quality: 'hd',
      style: 'natural'
    })
  )
);
```

### Fashion Design

```typescript
const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];

const fashionImages = await Promise.all(
  seasons.map(season =>
    llm.createImage({
      prompt: `High fashion editorial photo, ${season} collection, runway model, artistic lighting, vogue style`,
      size: '1024x1792',
      quality: 'hd',
      style: 'vivid'
    })
  )
);
```

### Game Assets

```typescript
const gameAssets = [
  { name: 'sword', prompt: 'Fantasy RPG sword, glowing rune on blade, ornate handle, game asset, transparent background' },
  { name: 'shield', prompt: 'Fantasy RPG shield, intricate design, silver and gold, game asset, transparent background' },
  { name: 'potion', prompt: 'Fantasy RPG health potion, glowing green liquid, ornate bottle, game asset' }
];

const assets = await Promise.all(
  gameAssets.map(asset =>
    llm.createImage({
      prompt: asset.prompt,
      size: '512x512',
      model: 'dall-e-2'  // Faster for many assets
    })
  )
);
```

### Logo Variations

```typescript
const baseLogoDescription = 'Minimalist tech company logo, abstract shape, geometric, clean lines';

const variations = [
  { colors: 'blue and white' },
  { colors: 'black and gold' },
  { colors: 'red and gray' },
  { colors: 'green and teal' }
];

const logos = await Promise.all(
  variations.map(variation =>
    llm.createImage({
      prompt: `${baseLogoDescription}, ${variation.colors} color scheme, vector style, white background`,
      size: '512x512',
      model: 'dall-e-2'
    })
  )
);
```
