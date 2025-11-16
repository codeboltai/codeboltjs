import {
  BaseAddVectorItemNode,
  BaseQueryVectorItemNode,
  BaseQueryVectorItemsNode
} from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetVector Node - actual implementation
import { BaseGetVectorNode } from '@agent-creator/shared-nodes';

export class GetVectorNode extends BaseGetVectorNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key: any = this.getInputData(1);

    if (!key) {
      console.error('GetVectorNode error: key is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result = await codebolt.vectordb.getVector(key);

      // Update outputs with success results
      this.setOutputData(1, result); // vector output
      this.setOutputData(2, true); // success output

      // Trigger the vectorRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to get vector`;
      this.setOutputData(1, null); // vector output
      this.setOutputData(2, false); // success output
      console.error('GetVectorNode error:', error);
    }
  }
}

// Backend-specific AddVectorItem Node - actual implementation
export class AddVectorItemNode extends BaseAddVectorItemNode {
  constructor() {
    super();
  }

  async onExecute() {
    const item: any = this.getInputData(1);

    if (item === undefined || item === null) {
      console.error('AddVectorItemNode error: item is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result = await codebolt.vectordb.addVectorItem(item);

      // Update outputs with success results
      this.setOutputData(1, result); // item output
      this.setOutputData(2, true); // success output

      // Trigger the itemAdded event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to add vector item`;
      this.setOutputData(1, null); // item output
      this.setOutputData(2, false); // success output
      console.error('AddVectorItemNode error:', error);
    }
  }
}

// Backend-specific QueryVectorItem Node - actual implementation
export class QueryVectorItemNode extends BaseQueryVectorItemNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key: any = this.getInputData(1);

    if (!key) {
      console.error('QueryVectorItemNode error: key is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const result = await codebolt.vectordb.queryVectorItem(key);

      // Update outputs with success results
      this.setOutputData(1, result); // item output
      this.setOutputData(2, true); // success output

      // Trigger the itemQueried event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to query vector item`;
      this.setOutputData(1, null); // item output
      this.setOutputData(2, false); // success output
      console.error('QueryVectorItemNode error:', error);
    }
  }
}

// Backend-specific QueryVectorItems Node - actual implementation
export class QueryVectorItemsNode extends BaseQueryVectorItemsNode {
  constructor() {
    super();
  }

  async onExecute() {
    const items: unknown = this.getInputData(1);
    const dbPath: unknown = this.getInputData(2);

    if (!Array.isArray(items)) {
      console.error('QueryVectorItemsNode error: items array is required');
      this.setOutputData(2, false);
      return;
    }

    try {
      const normalizedItems = items.filter((item) => item !== undefined && item !== null);
      const path = typeof dbPath === 'string' && dbPath.trim().length ? dbPath.trim() : '';

      const queryVectorItems = codebolt.vectordb.queryVectorItems as unknown as (payload: any[], destination: string) => Promise<any>;
      const result = await queryVectorItems(normalizedItems, path);

      // Update outputs with success results
      this.setOutputData(1, result); // items output
      this.setOutputData(2, true); // success output

      // Trigger the itemsQueried event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to query vector items`;
      this.setOutputData(1, []); // items output
      this.setOutputData(2, false); // success output
      console.error('QueryVectorItemsNode error:', error);
    }
  }
}