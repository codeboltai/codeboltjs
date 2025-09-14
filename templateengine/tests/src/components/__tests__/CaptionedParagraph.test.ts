import { testComponent } from './test-utils';

describe('CaptionedParagraph Component', () => {
  test('should render captioned paragraph with default settings', async () => {
    const template = '<CaptionedParagraph caption="Test Caption">This is the content</CaptionedParagraph>';
    const result = await testComponent(template);
    expect(result).toContain('Test Caption');
    expect(result).toContain('This is the content');
  });

  test('should render captioned paragraph with header style', async () => {
    const template = '<CaptionedParagraph caption="Test Caption" captionStyle="header">This is the content</CaptionedParagraph>';
    const result = await testComponent(template);
    expect(result).toContain('### Test Caption');
  });

  test('should render captioned paragraph with bold style', async () => {
    const template = '<CaptionedParagraph caption="Test Caption" captionStyle="bold">This is the content</CaptionedParagraph>';
    const result = await testComponent(template);
    expect(result).toContain('**Test Caption**');
  });

  // test('should render captioned paragraph with different syntax', async () => {
  //   const template = '<CaptionedParagraph caption="Test Caption" syntax="html">This is the content</CaptionedParagraph>';
  //   const result = await testComponent(template);
  //   expect(result).toContain('<h3>Test Caption</h3>');
  // });
});