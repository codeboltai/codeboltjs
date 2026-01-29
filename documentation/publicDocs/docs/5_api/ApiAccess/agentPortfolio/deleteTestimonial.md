---
name: deleteTestimonial
cbbaseinfo:
  description: Deletes a testimonial by its ID.
cbparameters:
  parameters:
    - name: testimonialId
      typeName: string
      description: The ID of the testimonial to delete.
  returns:
    signatureTypeName: "Promise<DeleteTestimonialResponse>"
    description: A promise that resolves when testimonial is deleted.
    typeArgs: []
data:
  name: deleteTestimonial
  category: agentPortfolio
  link: deleteTestimonial.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
await codebolt.agentPortfolio.deleteTestimonial('testimonial-123');
```

### Notes

- Only the testimonial author can delete it
- Deletion is permanent
- Consider updating instead of deleting when possible
