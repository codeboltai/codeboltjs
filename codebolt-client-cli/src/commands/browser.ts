import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';

export function registerBrowserCommands(program: Command): void {
  const browser = program.command('browser').description('Browser automation');

  browser
    .command('navigate')
    .description('Navigate to a URL')
    .requiredOption('--url <url>', 'URL to navigate to')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.browser.navigate({ url: options.url } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  browser
    .command('click')
    .description('Click an element')
    .requiredOption('--selector <selector>', 'CSS selector')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.browser.click({ selector: options.selector } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  browser
    .command('fill')
    .description('Fill a form field')
    .requiredOption('--selector <selector>', 'CSS selector')
    .requiredOption('--value <value>', 'Value to fill')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.browser.fill({ selector: options.selector, value: options.value } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  browser
    .command('screenshot')
    .description('Take a screenshot')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.browser.screenshot();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  browser
    .command('action')
    .description('Send a browser action')
    .requiredOption('--data <json>', 'Action data as JSON')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.browser.sendAction(data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
