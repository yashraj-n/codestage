# AssessmentControllerApi

All URIs are relative to *http://localhost:3000*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createAssessment**](AssessmentControllerApi.md#createassessment) | **POST** /assessment |  |
| [**getAllAssessments**](AssessmentControllerApi.md#getallassessments) | **GET** /assessment |  |



## createAssessment

> object createAssessment(createAssessmentDTO)



### Example

```ts
import {
  Configuration,
  AssessmentControllerApi,
} from '';
import type { CreateAssessmentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AssessmentControllerApi();

  const body = {
    // CreateAssessmentDTO
    createAssessmentDTO: ...,
  } satisfies CreateAssessmentRequest;

  try {
    const data = await api.createAssessment(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createAssessmentDTO** | [CreateAssessmentDTO](CreateAssessmentDTO.md) |  | |

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `*/*`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllAssessments

> Array&lt;Assessment&gt; getAllAssessments()



### Example

```ts
import {
  Configuration,
  AssessmentControllerApi,
} from '';
import type { GetAllAssessmentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AssessmentControllerApi();

  try {
    const data = await api.getAllAssessments();
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

[**Array&lt;Assessment&gt;**](Assessment.md)

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

