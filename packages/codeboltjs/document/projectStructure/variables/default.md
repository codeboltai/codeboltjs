[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [projectStructure.ts:28](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/projectStructure.ts#L28)

Project Structure Module for codeboltjs
Provides functionality for managing project metadata, packages, routes, dependencies, etc.
Mirrors the projectStructureService.cli.ts operations via WebSocket.

## Type Declaration

### addCommand()

> **addCommand**: (`packageId`, `command`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Add a run command to a package

#### Parameters

##### packageId

`string`

##### command

`Omit`\<`RunCommand`, `"id"`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### addDependency()

> **addDependency**: (`packageId`, `dependency`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Add a dependency to a package

#### Parameters

##### packageId

`string`

##### dependency

`Omit`\<`Dependency`, `"id"`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### addDeployment()

> **addDeployment**: (`packageId`, `config`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Add a deployment config to a package

#### Parameters

##### packageId

`string`

##### config

`Omit`\<`DeploymentConfig`, `"id"`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### addRoute()

> **addRoute**: (`packageId`, `route`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Add an API route to a package

#### Parameters

##### packageId

`string`

##### route

`Omit`\<`ApiRoute`, `"id"`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### addTable()

> **addTable**: (`packageId`, `table`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Add a database table to a package

#### Parameters

##### packageId

`string`

##### table

`Omit`\<`DatabaseTable`, `"id"`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### addUiRoute()

> **addUiRoute**: (`packageId`, `route`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Add a UI route to a package

#### Parameters

##### packageId

`string`

##### route

`Omit`\<`UiRoute`, `"id"`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### createPackage()

> **createPackage**: (`data`, `workspacePath?`) => `Promise`\<`ProjectStructurePackageResponse`\>

Create a new package

#### Parameters

##### data

`CreatePackageData`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructurePackageResponse`\>

### deleteCommand()

> **deleteCommand**: (`packageId`, `commandId`, `workspacePath?`) => `Promise`\<`ProjectStructureDeleteResponse`\>

Delete a run command

#### Parameters

##### packageId

`string`

##### commandId

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureDeleteResponse`\>

### deleteDependency()

> **deleteDependency**: (`packageId`, `dependencyId`, `workspacePath?`) => `Promise`\<`ProjectStructureDeleteResponse`\>

Delete a dependency

#### Parameters

##### packageId

`string`

##### dependencyId

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureDeleteResponse`\>

### deleteDeployment()

> **deleteDeployment**: (`packageId`, `configId`, `workspacePath?`) => `Promise`\<`ProjectStructureDeleteResponse`\>

Delete a deployment config

#### Parameters

##### packageId

`string`

##### configId

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureDeleteResponse`\>

### deletePackage()

> **deletePackage**: (`packageId`, `workspacePath?`) => `Promise`\<`ProjectStructureDeleteResponse`\>

Delete a package

#### Parameters

##### packageId

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureDeleteResponse`\>

### deleteRoute()

> **deleteRoute**: (`packageId`, `routeId`, `workspacePath?`) => `Promise`\<`ProjectStructureDeleteResponse`\>

Delete an API route

#### Parameters

##### packageId

`string`

##### routeId

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureDeleteResponse`\>

### deleteTable()

> **deleteTable**: (`packageId`, `tableId`, `workspacePath?`) => `Promise`\<`ProjectStructureDeleteResponse`\>

Delete a database table

#### Parameters

##### packageId

`string`

##### tableId

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureDeleteResponse`\>

### deleteUiRoute()

> **deleteUiRoute**: (`packageId`, `routeId`, `workspacePath?`) => `Promise`\<`ProjectStructureDeleteResponse`\>

Delete a UI route

#### Parameters

##### packageId

`string`

##### routeId

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureDeleteResponse`\>

### getMetadata()

> **getMetadata**: (`workspacePath?`) => `Promise`\<`ProjectStructureMetadataResponse`\>

Get complete project metadata

#### Parameters

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureMetadataResponse`\>

### getPackage()

> **getPackage**: (`packageId`, `workspacePath?`) => `Promise`\<`ProjectStructurePackageResponse`\>

Get a specific package by ID

#### Parameters

##### packageId

`string`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructurePackageResponse`\>

### getPackages()

> **getPackages**: (`workspacePath?`) => `Promise`\<`ProjectStructurePackagesResponse`\>

Get all packages in the workspace

#### Parameters

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructurePackagesResponse`\>

### updateCommand()

> **updateCommand**: (`packageId`, `commandId`, `updates`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update a run command

#### Parameters

##### packageId

`string`

##### commandId

`string`

##### updates

`Partial`\<`RunCommand`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### updateDependency()

> **updateDependency**: (`packageId`, `dependencyId`, `updates`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update a dependency

#### Parameters

##### packageId

`string`

##### dependencyId

`string`

##### updates

`Partial`\<`Dependency`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### updateDeployment()

> **updateDeployment**: (`packageId`, `configId`, `updates`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update a deployment config

#### Parameters

##### packageId

`string`

##### configId

`string`

##### updates

`Partial`\<`DeploymentConfig`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### updateDesignGuidelines()

> **updateDesignGuidelines**: (`packageId`, `guidelines`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update design guidelines for a package

#### Parameters

##### packageId

`string`

##### guidelines

`DesignGuidelines`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### updateFrontendFramework()

> **updateFrontendFramework**: (`packageId`, `framework`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update frontend framework for a package

#### Parameters

##### packageId

`string`

##### framework

`FrameworkInfo`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### updateGit()

> **updateGit**: (`gitInfo`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update git information

#### Parameters

##### gitInfo

`GitInfo`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### updateMetadata()

> **updateMetadata**: (`updates`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update workspace metadata

#### Parameters

##### updates

`Record`\<`string`, `any`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### updatePackage()

> **updatePackage**: (`packageId`, `updates`, `workspacePath?`) => `Promise`\<`ProjectStructurePackageResponse`\>

Update a package

#### Parameters

##### packageId

`string`

##### updates

`UpdatePackageData`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructurePackageResponse`\>

### updateRoute()

> **updateRoute**: (`packageId`, `routeId`, `updates`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update an API route

#### Parameters

##### packageId

`string`

##### routeId

`string`

##### updates

`Partial`\<`ApiRoute`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### updateSection()

> **updateSection**: (`packageId`, `section`, `sectionData`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update a specific section of a package

#### Parameters

##### packageId

`string`

##### section

`string`

##### sectionData

`any`

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### updateTable()

> **updateTable**: (`packageId`, `tableId`, `updates`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update a database table

#### Parameters

##### packageId

`string`

##### tableId

`string`

##### updates

`Partial`\<`DatabaseTable`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>

### updateUiRoute()

> **updateUiRoute**: (`packageId`, `routeId`, `updates`, `workspacePath?`) => `Promise`\<`ProjectStructureUpdateResponse`\>

Update a UI route

#### Parameters

##### packageId

`string`

##### routeId

`string`

##### updates

`Partial`\<`UiRoute`\>

##### workspacePath?

`string`

#### Returns

`Promise`\<`ProjectStructureUpdateResponse`\>
