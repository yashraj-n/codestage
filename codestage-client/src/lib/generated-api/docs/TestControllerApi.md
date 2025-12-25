# TestControllerApi

All URIs are relative to *http://localhost:3000*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**test**](TestControllerApi.md#test) | **GET** /real |  |



## test

> object test()



### Example

```ts
import {
  Configuration,
  TestControllerApi,
} from '';
import type { TestRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TestControllerApi();

  try {
    const data = await api.test();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

