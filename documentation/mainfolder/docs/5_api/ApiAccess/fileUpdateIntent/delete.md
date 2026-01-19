---
name: delete
cbbaseinfo:
  description: Deletes a file update intent permanently.
cbparameters:
  parameters:
    - name: id
      type: string
      required: true
      description: The unique identifier of the file update intent.
  returns:
    signatureTypeName: Promise<{ success: boolean }>
    description: A promise that resolves with deletion status.
data:
  name: delete
  category: fileUpdateIntent
  link: delete.md
---
<CBBaseInfo/>
<CBParameters/>

### Examples

#### Example 1: Delete Intent
```javascript
const result = await codebolt.fileUpdateIntent.delete('intent-id-123');

if (result.success) {
  console.log('Intent deleted');
}
```

### Notes
- Permanent deletion, use with caution
- Prefer complete/cancel for active intents
- Use delete for cleanup of old intents
