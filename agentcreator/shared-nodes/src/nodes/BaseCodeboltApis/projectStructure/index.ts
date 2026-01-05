import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseGetProjectMetadataNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/projectStructure/getMetadata", title: "Get Project Metadata", category: "codebolt/projectStructure", description: "Get project structure metadata", icon: "🏗️", color: "#607D8B" };
    constructor() {
        super(BaseGetProjectMetadataNode.metadata.title, BaseGetProjectMetadataNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("metadata", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetPackagesNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/projectStructure/getPackages", title: "Get Packages", category: "codebolt/projectStructure", description: "Get all packages", icon: "📦", color: "#607D8B" };
    constructor() {
        super(BaseGetPackagesNode.metadata.title, BaseGetPackagesNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("packages", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseCreatePackageNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/projectStructure/createPackage", title: "Create Package", category: "codebolt/projectStructure", description: "Create a new package", icon: "➕", color: "#607D8B" };
    constructor() {
        super(BaseCreatePackageNode.metadata.title, BaseCreatePackageNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("data", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("package", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseUpdatePackageNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/projectStructure/updatePackage", title: "Update Package", category: "codebolt/projectStructure", description: "Update a package", icon: "✏️", color: "#607D8B" };
    constructor() {
        super(BaseUpdatePackageNode.metadata.title, BaseUpdatePackageNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("packageId", "string");
        this.addInput("updates", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("package", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseDeletePackageNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/projectStructure/deletePackage", title: "Delete Package", category: "codebolt/projectStructure", description: "Delete a package", icon: "🗑️", color: "#607D8B" };
    constructor() {
        super(BaseDeletePackageNode.metadata.title, BaseDeletePackageNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("packageId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}
