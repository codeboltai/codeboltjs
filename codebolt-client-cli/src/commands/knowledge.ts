import { Command } from 'commander';
import { createClient, GlobalOptions } from '../client-factory';
import { output, errorOutput } from '../output';

export function registerKnowledgeCommands(program: Command): void {
  const knowledge = program.command('knowledge').description('Knowledge base management');

  const collections = knowledge.command('collections').description('Knowledge collections');

  collections
    .command('list')
    .description('List collections')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.knowledge.listCollections();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  collections
    .command('create')
    .description('Create a collection')
    .requiredOption('--name <name>', 'Collection name')
    .option('--description <desc>', 'Collection description')
    .action(async (options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.knowledge.createCollection({ name: options.name, description: options.description } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  collections
    .command('get <id>')
    .description('Get a collection')
    .action(async (id: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.knowledge.getCollection(id);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  collections
    .command('delete <id>')
    .description('Delete a collection')
    .action(async (id: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.knowledge.deleteCollection(id);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  const docs = knowledge.command('docs').description('Knowledge documents');

  docs
    .command('list <collectionId>')
    .description('List documents in collection')
    .action(async (collectionId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.knowledge.listDocuments(collectionId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  docs
    .command('add <collectionId>')
    .description('Add documents to collection')
    .requiredOption('--data <json>', 'Document data as JSON')
    .action(async (collectionId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const data = JSON.parse(options.data);
        const result = await client.knowledge.addDocuments(collectionId, data);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  docs
    .command('add-url <collectionId>')
    .description('Add document from URL')
    .requiredOption('--url <url>', 'Document URL')
    .action(async (collectionId: string, options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.knowledge.addDocumentFromUrl(collectionId, { url: options.url } as any);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  docs
    .command('get <documentId>')
    .description('Get a document')
    .action(async (documentId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.knowledge.getDocument(documentId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  docs
    .command('delete <documentId>')
    .description('Delete a document')
    .action(async (documentId: string, _options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.knowledge.deleteDocument(documentId);
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });

  knowledge
    .command('strategies')
    .description('Get knowledge strategies')
    .action(async (_options: any, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
      const client = createClient(globalOpts);
      try {
        const result = await client.knowledge.getStrategies();
        output(result, globalOpts);
      } catch (err: any) {
        errorOutput(err.message, globalOpts);
      }
    });
}
