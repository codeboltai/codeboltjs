# Project Settings

The **Project Settings** menu is where you configure all aspects of a specific project. These settings tailor the AI's behavior, knowledge, and execution environment to your project's unique needs.

![appSetting](/configure/appSetting.png)

## App Settings
This is the main navigation header for all project-specific configuration categories.

## Technical Info
This section tells the AI about your project's technical foundation—what languages, frameworks, and services it uses.
- **Project Languages:** The programming languages used (e.g., JavaScript, Python, Go).
- **Project Frameworks:** The specific frameworks used (e.g., React, Next.js, Express).
- **Services:** The runtime or services required (e.g., `node:20`, `python:3.11`, `postgresql`).

## Secrets
 A secure vault for storing sensitive configuration values that should not be hard-coded into your project files.
- **Purpose:** To safely provide API keys, database URLs, and other secrets to the AI and the execution environment.
- **Structure:** Each secret has a **Name**, a **Description**, and the **Secret** value itself.

## Knowledge Base
 Enhances the AI's understanding of your project by providing custom definitions and indexing your codebase.
- **Codebase Indexing:** Enables semantic search over your code. The AI analyzes your project's structure to provide accurate, context-aware answers.
- **Term Definitions:** Allows you to create a custom glossary for the AI.
  - **Term Name:** The name of a project-specific concept or variable.
  - **Term Prompt:** A description that explains the term to the AI.

## Instructions
 Provides direct guidance, rules, and context to the AI on how to handle this specific project.
- **Text Instructions:** Free-form text for detailed commands or coding styles.
- **Local File Instructions:** Point the AI to a specific file (e.g., `ARCHITECTURE.md`) that contains important instructions.

## Usage
 Configures the different modes or phases of working with your project: Development, Installation, and Application Use.

### Develop Settings
Configures the AI workflow for active coding.
- **Select Agents:** Choose which AI agent assists with development (e.g., `codebolt aider`).
- **Select Layout:** Choose a UI layout for the development workspace (e.g., `basic`).
- **Run Command:** Define the command to start the development server (e.g., `npm run dev`).

### Install Settings
Configures how the project dependencies are installed.
- **Custom Installation Agent:** Assign a specific AI agent to handle installation tasks.

### AppUse Settings (Application Use)
Configures how the application is run and previewed after development.
- **Select Agents:** Choose an agent for tasks like generating documentation.
- **Pre-run/Command:** Define any setup or execution commands.
- **App Preview:** Set the preview type (e.g., `Web` for a web application).

