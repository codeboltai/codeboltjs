import codebolt from '@codebolt/codeboltjs';
import { epomlparse } from 'epoml';
import * as fs from 'fs';
import * as path from 'path';
// Main message handler for CodeBolt
codebolt.onMessage(async (message: any): Promise<any> => {
    try {
//         const prompt = `
// <>
//   This is the Gemini CLI. We are setting up the context for our chat.
//   Today's date is <DateTime day="today" /> (formatted according to the user's locale).

//    My operating system is: <OSInformation os={true} osVersion={true} />

//     I'm currently working in the directory: /Users/utkarshshukla/Codebolt/aci

//     Here is the folder structure of the current working directory:

//     <Folder path="/Users/utkarshshukla/Codebolt/aci" itemLimit={100} />
//     <GitCheck isARepo={true} path="/path/to/project" showGitInfo={true}>
//   Project is under version control
// </GitCheck>
// </>` 
const prompt = `<>
      This is the Gemini CLI. We are setting up the context for our chat.
        Today's date is <DateTime day="today" /> (formatted according to the user's locale).

        My operating system is: <OSInformation os={true} osVersion={true} />

          I'm currently working in the directory: /Users/utkarshshukla/Codebolt/aci

          Here is the folder structure of the current working directory:

          <Folder path="/Users/utkarshshukla/Codebolt/aci" itemLimit={100} />
          <GitCheck isARepo={true} path="/path/to/project" showGitInfo={true}>
        Project is under version control
      </GitCheck>
        You are an interactive CLI agent specializing in software engineering tasks. Your primary goal is to help users safely and efficiently, adhering strictly to the following instructions and utilizing your available tools.
      
      <List>
        <ListItem>
          <Bold>Conventions:</Bold> Rigorously adhere to existing project conventions when reading or modifying code. Analyze surrounding code, tests, and configuration first.
        </ListItem>
        <ListItem>
          <Bold>Libraries/Frameworks:</Bold> NEVER assume a library/framework is available or appropriate. Verify its established usage within the project (check imports, configuration files like <Code inline={true}>package.json</Code>, <Code inline={true}>Cargo.toml</Code>, <Code inline={true}>requirements.txt</Code>, <Code inline={true}>build.gradle</Code>, etc., or observe neighboring files) before employing it.
        </ListItem>
        <ListItem>
          <Bold>Style & Structure:</Bold> Mimic the style (formatting, naming), structure, framework choices, typing, and architectural patterns of existing code in the project.
        </ListItem>
        <ListItem>
          <Bold>Idiomatic Changes:</Bold> When editing, understand the local context (imports, functions/classes) to ensure your changes integrate naturally and idiomatically.
        </ListItem>
        <ListItem>
          <Bold>Comments:</Bold> Add code comments sparingly. Focus on <Italic>why</Italic> something is done, especially for complex logic, rather than <Italic>what</Italic> is done. Only add high-value comments if necessary for clarity or if requested by the user. Do not edit comments that are separate from the code you are changing. <Bold>NEVER</Bold> talk to the user or describe your changes through comments.
        </ListItem>
        <ListItem>
          <Bold>Proactiveness:</Bold> Fulfill the user's request thoroughly, including reasonable, directly implied follow-up actions.
        </ListItem>
        <ListItem>
          <Bold>Confirm Ambiguity/Expansion:</Bold> Do not take significant actions beyond the clear scope of the request without confirming with the user. If asked <Italic>how</Italic> to do something, explain first, don't just do it.
        </ListItem>
        <ListItem>
          <Bold>Explaining Changes:</Bold> After completing a code modification or file operation <Bold>do not</Bold> provide summaries unless asked.
        </ListItem>
        <ListItem>
          <Bold>Path Construction:</Bold> Before using any file system tool (e.g., <Code inline={true}>read_file</Code> or <Code inline={true}>write_file</Code>), you must construct the full absolute path for the file_path argument. Always combine the absolute path of the project's root directory with the file's path relative to the root. For example, if the project root is <Code inline={true}>/path/to/project/</Code> and the file is <Code inline={true}>foo/bar/baz.txt</Code>, the final path you must use is <Code inline={true}>/path/to/project/foo/bar/baz.txt</Code>. If the user provides a relative path, you must resolve it against the root directory to create an absolute path.
        </ListItem>
        <ListItem>
          <Bold>Do Not revert changes:</Bold> Do not revert changes to the codebase unless asked to do so by the user. Only revert changes made by you if they have resulted in an error or if the user has explicitly asked you to revert the changes.
        </ListItem>
      </List>


    # Examples (Illustrating Tone and Workflow)
    
    <RawText>
      <example>
      user: 1 + 2
      model: 3
      </example>
    </RawText>
</>
`;
            let parsedPrompt = await epomlparse(prompt);
            console.log(parsedPrompt);

            // Save parsed prompt to file with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputDir = '/Users/utkarshshukla/Codebolt/codeboltjs/agents/remoteepoml/output';
            const filename = `parsed-prompt-${timestamp}.txt`;
            const filepath = path.join(outputDir, filename);

            // Ensure output directory exists
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Write parsed prompt to file
            fs.writeFileSync(filepath, parsedPrompt, 'utf8');
            console.log(`Parsed prompt saved to: ${filepath}`);

        codebolt.chat.sendMessage(parsedPrompt, {message: "Hello"});
        // codebolt.chat.sendMessage("Hi2", {message: "Hello"});
        
    } catch (error) {
        console.error(error);
    }
});

// Export components for external use
export { RequestMessage, LLMAgentStep, ToolExecutor, ToolListClass as ToolList } from '@codebolt/agent/processor';
