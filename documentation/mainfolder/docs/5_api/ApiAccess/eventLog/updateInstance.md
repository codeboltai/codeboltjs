---
name: updateInstance
cbbaseinfo:
  description: Updates the name or description of an event log instance.
cbparameters:
  parameters:
    - name: instanceId
      type: string
      required: true
      description: The unique identifier of the event log instance.
    - name: updates
      type: UpdateEventLogInstanceParams
      required: true
      description: Object containing name and/or description to update.
  returns:
    signatureTypeName: "Promise<EventLogInstanceResponse>"
    description: A promise that resolves with the updated instance details.
data:
  name: updateInstance
  category: eventLog
  link: updateInstance.md
---
<CBBaseInfo/>
<CBParameters/>

### Examples

#### Example 1: Update Instance Name
```javascript
const result = await codebolt.eventLog.updateInstance(
  'log-instance-id',
  { name: 'production-user-activity' }
);
```

#### Example 2: Update Description
```javascript
const result = await codebolt.eventLog.updateInstance(
  'log-instance-id',
  { description: 'Updated description reflecting new usage patterns' }
);
```

### Notes
- Only name and description can be updated
- Instance data (events) is not affected
