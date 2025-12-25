
# JwtUser

User info stored in JWT

## Properties

Name | Type
------------ | -------------
`userId` | string
`name` | string
`email` | string
`photoUrl` | string

## Example

```typescript
import type { JwtUser } from ''

// TODO: Update the object below with actual values
const example = {
  "userId": null,
  "name": null,
  "email": null,
  "photoUrl": null,
} satisfies JwtUser

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as JwtUser
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


