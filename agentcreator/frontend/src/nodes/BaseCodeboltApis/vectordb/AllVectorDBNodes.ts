// Import all base nodes
import {
  BaseGetVectorNode,
  BaseAddVectorItemNode,
  BaseQueryVectorItemNode,
  BaseQueryVectorItemsNode
} from '@agent-creator/shared-nodes';

// Frontend GetVector Node - UI only
export class GetVectorNode extends BaseGetVectorNode {
  constructor() {
    super();
  }
}

// Frontend AddVectorItem Node - UI only
export class AddVectorItemNode extends BaseAddVectorItemNode {
  constructor() {
    super();
  }
}

// Frontend QueryVectorItem Node - UI only
export class QueryVectorItemNode extends BaseQueryVectorItemNode {
  constructor() {
    super();
  }
}

// Frontend QueryVectorItems Node - UI only
export class QueryVectorItemsNode extends BaseQueryVectorItemsNode {
  constructor() {
    super();
  }
}