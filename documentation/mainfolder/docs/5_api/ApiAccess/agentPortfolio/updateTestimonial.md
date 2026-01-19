---
name: updateTestimonial
cbbaseinfo:
  description: Updates an existing testimonial with new content.
cbparameters:
  parameters:
    - name: testimonialId
      typeName: string
      description: The ID of the testimonial to update.
    - name: content
      typeName: string
      description: The new testimonial content.
  returns:
    signatureTypeName: "Promise<UpdateTestimonialResponse>"
    description: A promise that resolves to the updated testimonial.
    typeArgs: []
data:
  name: updateTestimonial
  category: agentPortfolio
  link: updateTestimonial.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
await codebolt.agentPortfolio.updateTestimonial('testimonial-123', 'Updated feedback content');
```

### Notes

- Only the testimonial author can update it
- Updates maintain the original creation timestamp
