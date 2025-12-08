package com.yashrajn.codestageserver.services;

import com.yashrajn.codestageserver.models.dto.Judge0Request;
import com.yashrajn.codestageserver.models.dto.Judge0Response;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestClient;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class CodeExecutionService {
    private final RestClient httpClient;

    CodeExecutionService(@Value("${judge0.api-url}") String apiUrl) {
        log.info("Judge0 API URL: {}", apiUrl);
        httpClient = RestClient.builder()
                .baseUrl(apiUrl)
                .build();
    }

    public Judge0Response executeCode(Judge0Request body) {
        return httpClient.post()
                .uri("/submissions?wait=true&base64_encoded=false")
                .body(body)
                .retrieve()
                .body(Judge0Response.class);
    }
}
