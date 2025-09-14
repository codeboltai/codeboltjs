import { testComponent } from './test-utils';

describe('Audio Component', () => {
  test('should render basic audio component with base64', async () => {
    const template = '<Audio base64="dGVzdCBhdWRpbw==" alt="Test audio" />';
    const result = await testComponent(template);
    expect(result).toContain('[Audio: audio/mpeg, base64: dGVzdCBhdWRpbw==]');
  });

  test('should render audio with base64 data', async () => {
    const template = '<Audio base64="dGVzdCBhdWRpbw==" alt="Test audio" />';
    const result = await testComponent(template);
    expect(result).toContain('[Audio: audio/mpeg, base64: dGVzdCBhdWRpbw==]');
  });

  test('should render audio with position using base64', async () => {
    const template = '<Audio base64="dGVzdCBhdWRpbw==" alt="Test audio" position="top" />';
    const result = await testComponent(template);
    expect(result).toContain('[Audio: audio/mpeg, base64: dGVzdCBhdWRpbw==]');
  });

  test('should render audio with html syntax using base64', async () => {
    const template = '<Audio base64="dGVzdCBhdWRpbw==" alt="Test audio" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<audio');
    expect(result).toContain('data:audio/mpeg;base64,dGVzdCBhdWRpbw==');
    expect(result).toContain('controls');
  });

  test('should truncate long base64 data in multimedia syntax', async () => {
    const longBase64 = 'dGVzdCBhdWRpbyBkYXRhIHRoYXQgaXMgdmVyeSBsb25nIGFuZCBzaG91bGQgYmUgdHJ1bmNhdGVkIGZvciBkaXNwbGF5';
    const template = `<Audio base64="${longBase64}" alt="Test audio" />`;
    const result = await testComponent(template);
    expect(result).toContain('[Audio: audio/mpeg, base64: dGVzdCBhdWRpbyBkYXRhIHRoYXQgaXMgdmVyeSBsb25nIGFuZC...]');
  });

  test('should render audio component with real file', async () => {
    const template = '<Audio src="../../public/song.mp3" alt="Song audio" />';
    const result = await testComponent(template);
    expect(result).toContain('[Audio: audio/mpeg, base64:');
    expect(result).not.toContain('Song audio'); // Should not fallback to alt text
  });

  test('should render real file with html syntax', async () => {
    const template = '<Audio src="../../public/song.mp3" alt="Song audio" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<audio');
    expect(result).toContain('data:audio/mpeg;base64,');
    expect(result).toContain('controls');
  });

  test('should truncate real file base64 data (large file)', async () => {
    const template = '<Audio src="../../public/song.mp3" alt="Song audio" />';
    const result = await testComponent(template);
    expect(result).toContain('[Audio: audio/mpeg, base64:');
    expect(result).toContain('...]'); // Should be truncated due to large file size
    expect(result).not.toContain('Song audio'); // Should not fallback to alt text
  });

  test('should fallback to alt text when file not found', async () => {
    const template = '<Audio src="nonexistent.mp3" alt="Test audio" />';
    const result = await testComponent(template);
    expect(result).toContain('Test audio');
  });
});