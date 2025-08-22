---
name: retrieve_related_knowledge
cbbaseinfo:
  description: Retrieves related knowledge for a given query and filename.
cbparameters:
  parameters:
    - name: query
      typeName: string
      description: The query to retrieve related knowledge for.
    - name: filename
      typeName: string
      description: The name of the file associated with the query.
  returns:
    signatureTypeName: void
    description: ' '
    typeArgs: []
data:
  name: retrieve_related_knowledge
  category: rag
  link: retrieve_related_knowledge.md
---
<CBBaseInfo/> 
 <CBParameters/>

### Example

```js
import codebolt from '@codebolt/codeboltjs';

async function exampleRetrieveRelatedKnowledge() {
    await codebolt.rag.retrieve_related_knowledge("What is CodeBolt?", "example.txt");
    console.log("Related knowledge retrieved.");
}

exampleRetrieveRelatedKnowledge();
```

### status 
comming soon....