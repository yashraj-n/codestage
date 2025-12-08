package com.yashrajn.codestageserver.services;

import com.yashrajn.codestageserver.models.entity.Assessment;
import com.yashrajn.codestageserver.models.entity.CodeChange;
import com.yashrajn.codestageserver.repository.CodeChangeRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CodeChangeService {
    private final CodeChangeRepository codeChangeRepository;
    private final Map<String, CodeChange> buffer = new ConcurrentHashMap<String, CodeChange>();

    public CodeChangeService(CodeChangeRepository codeChangeRepository) {
        this.codeChangeRepository = codeChangeRepository;
    }

    @Async
    public void createCodeChange(String sessionId, String change) {
        CodeChange codeChange = CodeChange.builder()
                .code(change)
                .createdAt(Instant.now())
                .assessment(Assessment.builder().id(Integer.valueOf(sessionId)).build())
                .build();

        buffer.put(sessionId, codeChange);
    }

    @Scheduled(fixedRate = 2000)
    protected void flushBuffer() {
        codeChangeRepository.saveAll(buffer.values());
        buffer.clear();
    }
}
