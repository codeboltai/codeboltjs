[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [todo.ts:16](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/todo.ts#L16)

## Type Declaration

### addTodo()

> **addTodo**: (`params`) => `Promise`\<`AddTodoResponse`\>

**`Function`**

addTodo

#### Parameters

##### params

The parameters for adding a todo.

###### priority?

`"low"` \| `"medium"` \| `"high"`

The priority of the todo.

###### tags?

`string`[]

Tags for the todo.

###### title

`string`

The title of the todo.

#### Returns

`Promise`\<`AddTodoResponse`\>

A promise that resolves with the server response.

#### Description

Adds a new todo item.

### exportTodos()

> **exportTodos**: (`params?`) => `Promise`\<`ExportTodosResponse`\>

**`Function`**

exportTodos

#### Parameters

##### params?

The parameters for exporting todos.

###### format?

`"json"` \| `"markdown"`

The export format.

###### listId?

`string`

Optional list ID to filter.

###### status?

`string`[]

Optional status filter.

#### Returns

`Promise`\<`ExportTodosResponse`\>

A promise that resolves with the exported data.

#### Description

Exports todos in the specified format.

### getAllIncompleteTodos()

> **getAllIncompleteTodos**: () => `Promise`\<`GetAllIncompleteTodosResponse`\>

**`Function`**

getAllIncompleteTodos

#### Returns

`Promise`\<`GetAllIncompleteTodosResponse`\>

A promise that resolves with the server response.

#### Description

Retrieves all incomplete todo items.

### getTodoList()

> **getTodoList**: (`params?`) => `Promise`\<`GetTodoListResponse`\>

**`Function`**

getTodoList

#### Parameters

##### params?

`any`

The parameters for getting the todo list.

#### Returns

`Promise`\<`GetTodoListResponse`\>

A promise that resolves with the server response.

#### Description

Retrieves the todo list.

### importTodos()

> **importTodos**: (`params`) => `Promise`\<`ImportTodosResponse`\>

**`Function`**

importTodos

#### Parameters

##### params

The parameters for importing todos.

###### data

`string`

The import data (JSON or markdown).

###### format?

`"json"` \| `"markdown"`

The format of the import data.

###### listId?

`string`

Optional target list ID.

###### mergeStrategy?

`"replace"` \| `"merge"`

How to handle existing todos.

#### Returns

`Promise`\<`ImportTodosResponse`\>

A promise that resolves with the import result.

#### Description

Imports todos from the specified format.

### updateTodo()

> **updateTodo**: (`params`) => `Promise`\<`UpdateTodoResponse`\>

**`Function`**

updateTodo

#### Parameters

##### params

The parameters for updating a todo.

###### id

`string`

The ID of the todo to update.

###### priority?

`"low"` \| `"medium"` \| `"high"`

The new priority.

###### status?

`"pending"` \| `"completed"` \| `"processing"` \| `"cancelled"`

The new status.

###### tags?

`string`[]

The new tags.

###### title?

`string`

The new title.

#### Returns

`Promise`\<`UpdateTodoResponse`\>

A promise that resolves with the server response.

#### Description

Updates an existing todo item.
