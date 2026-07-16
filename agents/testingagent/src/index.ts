import codebolt from "@codebolt/codeboltjs";
import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (_reqMessage: FlatUserMessage) => {
  // const timestamp = Date.now();
  // const executionPlanId = `testingagent-execution-plan-${timestamp}`;
  // const executionPlanTaskId = `testingagent-task-${timestamp}`;
  // const featurePlanName = `testingagent-feature-plan-${timestamp}`;
  // const noteName = `testingagent-note-${timestamp}`;
  // const canvasName = `testingagent-canvas-${timestamp}`;
  // const featurePlanPath = `plans/${featurePlanName}.plan`;
  // const notePath = `notes/${noteName}.note`;
  // const canvasPath = `canvas/${canvasName}.canvas`;

  // const results: Record<string, unknown> = {};

  // try {
  //   results.toolNames = (await codebolt.tools.listRuntimeTools({
  //     includeBuiltIn: true,
  //     includeExternal: false,
  //     grep: "execution_plan|feature_plan|note_|canvas_",
  //   })).data.tools.map((tool) => tool.name);

  //   results.executionPlanGetAllTool = await codebolt.tools.execute("execution_plan_get_all", {});
  //   results.executionPlanCreateTool = await codebolt.tools.execute("execution_plan_create", {
  //     planId: executionPlanId,
  //     name: "Testing Agent Execution Plan",
  //     description: "Created by testingagent using execution_plan_create.",
  //     tasks: [],
  //   });
  //   results.executionPlanGetDetailTool = await codebolt.tools.execute("execution_plan_get_detail", {
  //     planId: executionPlanId,
  //   });
  //   results.executionPlanUpdateTool = await codebolt.tools.execute("execution_plan_update", {
  //     planId: executionPlanId,
  //     updates: {
  //       description: "Updated by testingagent using execution_plan_update.",
  //     },
  //   });
  //   results.executionPlanAddTaskTool = await codebolt.tools.execute("execution_plan_add_task", {
  //     planId: executionPlanId,
  //     task: {
  //       id: executionPlanTaskId,
  //       title: "Verify renamed execution plan tool",
  //       description: "Added by testingagent using execution_plan_add_task.",
  //       status: "pending",
  //     },
  //   });

  //   results.featurePlanListTool = await codebolt.tools.execute("feature_plan_list", {});
  //   results.featurePlanCreateTool = await codebolt.tools.execute("feature_plan_create", {
  //     fileName: featurePlanName,
  //   });
  //   results.featurePlanGetTool = await codebolt.tools.execute("feature_plan_get", {
  //     filePath: featurePlanPath,
  //   });
  //   results.featurePlanUpdateTool = await codebolt.tools.execute("feature_plan_update", {
  //     filePath: featurePlanPath,
  //     content: [
  //       "# Testing Agent Feature Plan",
  //       "",
  //       "Created by testingagent using feature_plan_update.",
  //     ].join("n"),
  //   });

  //   results.noteCreateTool = await codebolt.tools.execute("note_create", {
  //     fileName: noteName,
  //     content: "# Testing Agent NotennCreated by testingagent using note_create.",
  //   });
  //   results.noteGetTool = await codebolt.tools.execute("note_get", { filePath: notePath });
  //   results.noteAddCommentTool = await codebolt.tools.execute("note_add_comment", {
  //     filePath: notePath,
  //     text: "Testing note_add_comment from testingagent.",
  //     author: "testingagent",
  //   });
  //   results.noteListCommentsTool = await codebolt.tools.execute("note_list_comments", { filePath: notePath });
  //   results.noteLinkArtifactTool = await codebolt.tools.execute("note_link_artifact", {
  //     filePath: notePath,
  //     artifactPath: "artifact://testingagent/note-tool-api-test",
  //   });

  //   results.canvasCreateTool = await codebolt.tools.execute("canvas_create", { fileName: canvasName });
  //   results.canvasReadmeTool = await codebolt.tools.execute("canvas_readme", {});
  //   results.canvasGetContentTool = await codebolt.tools.execute("canvas_get_content", { filePath: canvasPath });
  //   results.canvasAddContentTool = await codebolt.tools.execute("canvas_add_content", {
  //     filePath: canvasPath,
  //     content: {
  //       elements: [
  //         {
  //           id: `rect-${timestamp}`,
  //           type: "rectangle",
  //           x: 80,
  //           y: 80,
  //           width: 160,
  //           height: 100,
  //           angle: 0,
  //           strokeColor: "#1e1e1e",
  //           backgroundColor: "transparent",
  //           fillStyle: "solid",
  //           strokeWidth: 2,
  //           strokeStyle: "solid",
  //           roughness: 1,
  //           opacity: 100,
  //           groupIds: [],
  //           frameId: null,
  //           roundness: null,
  //           seed: timestamp,
  //           version: 1,
  //           versionNonce: timestamp,
  //           isDeleted: false,
  //           boundElements: null,
  //           updated: timestamp,
  //           link: null,
  //           locked: false,
  //         },
  //       ],
  //     },
  //   });
  //   results.canvasLinkArtifactTool = await codebolt.tools.execute("canvas_link_artifact", {
  //     filePath: canvasPath,
  //     artifactPath: "artifact://testingagent/canvas-tool-api-test",
  //   });

  //   results.executionPlanGetAllApi = await codebolt.executionPlan.getAll();
  //   results.executionPlanCreateApi = await codebolt.executionPlan.create({
  //     planId: `${executionPlanId}-api`,
  //     name: "Testing Agent Execution Plan API",
  //     description: "Created by testingagent using codebolt.executionPlan.create.",
  //     tasks: [],
  //   });
  //   results.executionPlanGetDetailApi = await codebolt.executionPlan.getDetail(`${executionPlanId}-api`);
  //   results.executionPlanUpdateApi = await codebolt.executionPlan.update(`${executionPlanId}-api`, {
  //     description: "Updated by testingagent using codebolt.executionPlan.update.",
  //   });
  //   results.executionPlanAddTaskApi = await codebolt.executionPlan.addTask(`${executionPlanId}-api`, {
  //     id: `${executionPlanTaskId}-api`,
  //     title: "Verify renamed execution plan SDK API",
  //     description: "Added by testingagent using codebolt.executionPlan.addTask.",
  //     status: "pending",
  //   });

  //   results.featurePlanCreateApi = await codebolt.featurePlan.create(`${featurePlanName}-api`);
  //   results.featurePlanGetApi = await codebolt.featurePlan.get(`plans/${featurePlanName}-api.plan`);
  //   results.featurePlanUpdateApi = await codebolt.featurePlan.update(
  //     `plans/${featurePlanName}-api.plan`,
  //     "# Testing Agent Feature Plan APInnUpdated by testingagent using codebolt.featurePlan.update."
  //   );
  //   results.featurePlanListApi = await codebolt.featurePlan.list();

  //   results.noteCreateApi = await codebolt.note.create(`${noteName}-api`, "# Testing Agent Note API");
  //   results.noteGetApi = await codebolt.note.get(`notes/${noteName}-api.note`);
  //   results.noteListApi = await codebolt.note.list();

  //   results.canvasCreateApi = await codebolt.canvas.create(`${canvasName}-api`);
  //   results.canvasReadmeApi = codebolt.canvas.readme();
  //   results.canvasGetContentApi = await codebolt.canvas.getContent(`canvas/${canvasName}-api.canvas`);
  //   results.canvasAddContentApi = await codebolt.canvas.addContent(`canvas/${canvasName}-api.canvas`, {
  //     elements: [
  //       {
  //         id: `ellipse-${timestamp}`,
  //         type: "ellipse",
  //         x: 280,
  //         y: 90,
  //         width: 120,
  //         height: 120,
  //         angle: 0,
  //         strokeColor: "#1e1e1e",
  //         backgroundColor: "transparent",
  //         fillStyle: "solid",
  //         strokeWidth: 2,
  //         strokeStyle: "solid",
  //         roughness: 1,
  //         opacity: 100,
  //         groupIds: [],
  //         frameId: null,
  //         roundness: null,
  //         seed: timestamp + 1,
  //         version: 1,
  //         versionNonce: timestamp + 1,
  //         isDeleted: false,
  //         boundElements: null,
  //         updated: timestamp,
  //         link: null,
  //         locked: false,
  //       },
  //     ],
  //   });
  //   results.canvasLinkArtifactApi = await codebolt.canvas.linkArtifact(
  //     `canvas/${canvasName}-api.canvas`,
  //     "artifact://testingagent/canvas-api-test"
  //   );

  //   codebolt.chat.sendMessage(JSON.stringify({
  //     success: true,
  //     message: "Updated planning tools and CodeBoltJS APIs tested.",
  //     results,
  //   }, null, 2));
  // } catch (error) {
  //   codebolt.chat.sendMessage(JSON.stringify({
  //     success: false,
  //     message: "Updated planning tool/API test failed.",
  //     error: error instanceof Error ? error.message : String(error),
  //     results,
  //   }, null, 2));
  // }
  let response = await codebolt.tools.execute('get_available_tools_manifest', { "category": "executionplan", "mode": "details", "outputType": "text", "explanation": "Retrieving the detailed callable schemas for execution plan tools in text form." })
  codebolt.chat.sendMessage(JSON.stringify(response));
});
