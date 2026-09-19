import codebolt from "@codebolt/codeboltjs";
import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (_reqMessage: FlatUserMessage) => {
  const toolTests = [
    {
      name: "read Monaco wrapper",
      tool: "read_file",
      parameters: {
        absolute_path: "/Users/ravirawat/Documents/codeboltai/AiEditor/CodeBolt/packages/ui/src/Components/EditorComponents/SimpleTabAwareMonacoWrapper.tsx",
        offset: 1,
        limit: 260,
        explanation: "I’m inspecting the Monaco wrapper render path and its editor tab contract.",
      },
    },
    {
      name: "read Monaco tabs editor",
      tool: "read_file",
      parameters: {
        absolute_path: "/Users/ravirawat/Documents/codeboltai/AiEditor/CodeBolt/packages/ui/src/Components/EditorComponents/MonacoTabsEditor.tsx",
        offset: 120,
        limit: 180,
        explanation: "I’m inspecting the tab model and state used by the main editor.",
      },
    },
    {
      name: "find active tab render path",
      tool: "grep",
      parameters: {
        path: "/Users/ravirawat/Documents/codeboltai/AiEditor/CodeBolt/packages/ui/src/Components/EditorComponents/MonacoTabsEditor.tsx",
        pattern: "<SimpleTabAwareMonacoWrapper|activeFile|currentTab|tabs.map|setActiveFile|setCurrentTab",
        include: "MonacoTabsEditor.tsx",
        case_sensitive: true,
        explanation: "I’m locating where the active tab is selected and where Monaco is rendered.",
      },
    },
    {
      name: "read tabs component",
      tool: "read_file",
      parameters: {
        absolute_path: "/Users/ravirawat/Documents/codeboltai/AiEditor/CodeBolt/packages/ui/src/Components/EditorComponents/TabsComponent.tsx",
        offset: 1,
        limit: 220,
        explanation: "I’m checking how tabs expose file metadata and where image tabs can retain normal close behavior.",
      },
    },
  ];

  for (const test of toolTests) {
    try {
      await codebolt.chat.sendMessage(`Executing ${test.tool} through codebolt.tools.execute: ${test.name}`, {});
      const result = await codebolt.tools.execute(test.tool, test.parameters);
      await codebolt.chat.sendMessage(JSON.stringify({
        test: test.name,
        tool: test.tool,
        parameters: test.parameters,
        result,
      }, null, 2), {});
    } catch (error) {
      await codebolt.chat.sendMessage(JSON.stringify({
        test: test.name,
        tool: test.tool,
        parameters: test.parameters,
        error: error instanceof Error ? error.message : String(error),
      }, null, 2), {});
    }
  }
});
