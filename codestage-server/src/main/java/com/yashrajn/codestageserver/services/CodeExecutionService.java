package com.yashrajn.codestageserver.services;

import com.yashrajn.codestageserver.models.Judge0Language;
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

    public void executeCode() {
        Judge0Request body = Judge0Request.builder()
                .source_code("#include <stdio.h>\n\nint main(void) {\n  char name[10];\n  scanf(\"%s\", name);\n  printf(\"hello, %s\\n\", name);\n  return 0;\n}")
                .language_id(Judge0Language.C)
                .stdin(null)
                .build();

        Judge0Response res = httpClient.post()
                .uri("/submissions?wait=true")
                .body(body)
                .retrieve()
                .body(Judge0Response.class);

        log.info("Response: {}", res);
    }
}
