[@codebolt/codeboltjs](../README.md) / [Exports](../modules.md) / SystemPrompt

# Class: SystemPrompt

SystemPrompt class for loading and managing system prompts from YAML files

## Table of contents

### Constructors

- [constructor](SystemPrompt.md#constructor)

### Properties

- [filepath](SystemPrompt.md#filepath)
- [key](SystemPrompt.md#key)

### Methods

- [toPromptText](SystemPrompt.md#toprompttext)

## Constructors

### constructor

• **new SystemPrompt**(`filepath?`, `key?`): [`SystemPrompt`](SystemPrompt.md)

Creates a SystemPrompt instance

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `filepath` | `string` | `""` | Path to the YAML file containing prompts |
| `key` | `string` | `""` | Key identifier for the specific prompt |

#### Returns

[`SystemPrompt`](SystemPrompt.md)

#### Defined in

[src/agentlib/systemprompt.ts:23](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/systemprompt.ts#L23)

## Properties

### filepath

• `Private` **filepath**: `string`

#### Defined in

[src/agentlib/systemprompt.ts:15](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/systemprompt.ts#L15)

___

### key

• `Private` **key**: `string`

#### Defined in

[src/agentlib/systemprompt.ts:16](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/systemprompt.ts#L16)

## Methods

### toPromptText

▸ **toPromptText**(): `string`

Loads and returns the prompt text

#### Returns

`string`

The prompt text

**`Throws`**

If file cannot be read or parsed

#### Defined in

[src/agentlib/systemprompt.ts:33](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/systemprompt.ts#L33)
