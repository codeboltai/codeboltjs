import { CodeboltModule, param, fn } from './types';

export const browserModule: CodeboltModule = {
  name: 'browser',
  displayName: 'Browser',
  description: 'Browser automation and navigation',
  category: 'browser',
  functions: [
    fn('newPage', 'Opens new browser page', [
      param('options', 'object', false, 'Browser instance options'),
    ], 'NewPageResponse'),
    fn('getUrl', 'Gets current URL', [
      param('options', 'object', false, 'Operation options'),
    ], 'UrlResponse'),
    fn('goToPage', 'Navigates to URL', [
      param('url', 'string', true, 'URL to navigate to'),
      param('options', 'object', false, 'Navigation options'),
    ], 'NavigationResponse'),
    fn('screenshot', 'Takes screenshot', [
      param('options', 'object', false, 'Screenshot options'),
    ], 'ScreenshotResponse'),
    fn('getHTML', 'Gets HTML content', [
      param('options', 'object', false, 'Options'),
    ], 'HTMLResponse'),
    fn('getMarkdown', 'Gets Markdown content', [
      param('options', 'object', false, 'Options'),
    ], 'MarkdownResponse'),
    fn('getPDF', 'Gets PDF content', [
      param('options', 'object', false, 'PDF options'),
    ], 'PDFResponse'),
    fn('pdfToText', 'Converts PDF to text', [
      param('options', 'object', false, 'Conversion options'),
    ], 'TextResponse'),
    fn('getContent', 'Gets page content', [
      param('options', 'object', false, 'Content options'),
    ], 'ContentResponse'),
    fn('getSnapShot', 'Gets page snapshot', [
      param('options', 'object', false, 'Snapshot options'),
    ], 'SnapshotResponse'),
    fn('getBrowserInfo', 'Gets browser info (height, width, scroll)', [
      param('options', 'object', false, 'Info options'),
    ], 'BrowserInfoResponse'),
    fn('extractText', 'Extracts text from page', [
      param('options', 'object', false, 'Extraction options'),
    ], 'ExtractTextResponse'),
    fn('close', 'Closes browser page', [
      param('options', 'object', false, 'Close options'),
    ], 'CloseResponse'),
    fn('scroll', 'Scrolls page', [
      param('direction', 'string', true, 'Scroll direction (up/down)'),
      param('pixels', 'string', true, 'Pixels to scroll'),
      param('options', 'object', false, 'Scroll options'),
    ], 'ScrollResponse'),
    fn('type', 'Types into element', [
      param('elementid', 'string', true, 'Element ID'),
      param('text', 'string', true, 'Text to type'),
      param('options', 'object', false, 'Type options'),
    ], 'TypeResponse'),
    fn('click', 'Clicks element', [
      param('elementid', 'string', true, 'Element ID'),
      param('options', 'object', false, 'Click options'),
    ], 'ClickResponse'),
    fn('enter', 'Presses Enter key', [
      param('options', 'object', false, 'Enter options'),
    ], 'EnterResponse'),
    fn('search', 'Performs search', [
      param('elementid', 'string', true, 'Search element ID'),
      param('query', 'string', true, 'Search query'),
      param('options', 'object', false, 'Search options'),
    ], 'SearchResponse'),
    fn('listBrowserInstances', 'Lists all browser instances', [], 'BrowserInstancesResponse'),
    fn('getBrowserInstance', 'Gets specific browser instance', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'BrowserInstanceResponse'),
    fn('setActiveBrowserInstance', 'Sets active browser instance', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'SetActiveResponse'),
    fn('openNewBrowserInstance', 'Opens new browser instance', [
      param('options', 'object', false, 'Instance options'),
    ], 'NewInstanceResponse'),
    fn('closeBrowserInstance', 'Closes browser instance', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'CloseInstanceResponse'),
    fn('executeOnInstance', 'Executes operation on instance', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('operation', 'string', true, 'Operation type'),
      param('params', 'object', true, 'Operation parameters'),
    ], 'ExecuteResponse'),
  ],
};

export const crawlerModule: CodeboltModule = {
  name: 'crawler',
  displayName: 'Crawler',
  description: 'Web crawler control',
  category: 'browser',
  functions: [
    fn('start', 'Starts crawler', [], 'StartResponse'),
    fn('screenshot', 'Takes screenshot', [], 'ScreenshotResponse'),
    fn('goToPage', 'Navigates to URL', [
      param('url', 'string', true, 'URL to navigate to'),
    ], 'NavigationResponse'),
    fn('scroll', 'Scrolls page', [
      param('direction', 'string', true, 'Scroll direction'),
    ], 'ScrollResponse'),
    fn('click', 'Clicks element', [
      param('id', 'string', true, 'Element ID'),
    ], 'ClickResponse'),
  ],
};
