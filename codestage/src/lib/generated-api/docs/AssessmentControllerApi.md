# AssessmentControllerApi

All URIs are relative to *http://localhost:3000*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**checkCandidateToken**](AssessmentControllerApi.md#checkcandidatetoken) | **GET** /assessment/check-token |  |
| [**createAssessment**](AssessmentControllerApi.md#createassessmentoperation) | **POST** /assessment |  |
| [**createJoinToken**](AssessmentControllerApi.md#createjointoken) | **GET** /assessment/join/{sessionId} |  |
| [**getAllAssessments**](AssessmentControllerApi.md#getallassessments) | **GET** /assessment |  |
| [**replay**](AssessmentControllerApi.md#replay) | **GET** /assessment/replay/{sessionId} |  |



## checkCandidateToken

> JwtCandidate checkCandidateToken()



### Example

```ts
import {
  Configuration,
  AssessmentControllerApi,
} from '';
import type { CheckCandidateTokenRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AssessmentControllerApi();

  try {
    const data = await api.checkCandidateToken();
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

[**JwtCandidate**](JwtCandidate.md)

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


## createAssessment

> string createAssessment(createAssessmentRequest)



### Example

```ts
import {
  Configuration,
  AssessmentControllerApi,
} from '';
import type { CreateAssessmentOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AssessmentControllerApi();

  const body = {
    // CreateAssessmentRequest
    createAssessmentRequest: ...,
  } satisfies CreateAssessmentOperationRequest;

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
| **createAssessmentRequest** | [CreateAssessmentRequest](CreateAssessmentRequest.md) |  | |

### Return type

**string**

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


## createJoinToken

> string createJoinToken(sessionId)



### Example

```ts
import {
  Configuration,
  AssessmentControllerApi,
} from '';
import type { CreateJoinTokenRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AssessmentControllerApi();

  const body = {
    // string
    sessionId: sessionId_example,
  } satisfies CreateJoinTokenRequest;

  try {
    const data = await api.createJoinToken(body);
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
| **sessionId** | `string` |  | [Defaults to `undefined`] |

### Return type

**string**

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


## replay

> EventsResponse replay(sessionId)



### Example

```ts
import {
  Configuration,
  AssessmentControllerApi,
} from '';
import type { ReplayRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AssessmentControllerApi();

  const body = {
    // string
    sessionId: sessionId_example,
  } satisfies ReplayRequest;

  try {
    const data = await api.replay(body);
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
| **sessionId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**EventsResponse**](EventsResponse.md)

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

