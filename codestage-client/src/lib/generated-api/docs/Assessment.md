
# Assessment


## Properties

Name | Type
------------ | -------------
`id` | number
`completed` | boolean
`candidateName` | string
`candidateEmail` | string
`inviteNotes` | string
`adminId` | string
`createdAt` | Date
`code` | string
`notes` | string

## Example

```typescript
import type { Assessment } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "completed": null,
  "candidateName": null,
  "candidateEmail": null,
  "inviteNotes": null,
  "adminId": null,
  "createdAt": null,
  "code": null,
  "notes": null,
} satisfies Assessment

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Assessment
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


