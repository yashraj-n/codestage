package com.yashrajn.codestageserver.services;

import com.yashrajn.codestageserver.auth.JwtAdmin;
import com.yashrajn.codestageserver.models.dto.EventsResponse;
import com.yashrajn.codestageserver.models.entity.Assessment;
import com.yashrajn.codestageserver.models.entity.WorkspaceEvent;
import com.yashrajn.codestageserver.models.entity.WorkspaceEventType;
import com.yashrajn.codestageserver.models.ws.EndSessionEvent;
import com.yashrajn.codestageserver.repository.AssessmentRepository;
import com.yashrajn.codestageserver.repository.WorkspaceEventsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WorkspaceService {
    private final WorkspaceEventsRepository workspaceEventsRepository;
    private final AssessmentRepository assessmentRepository;
    private final Map<String, WorkspaceEvent> buffer = new ConcurrentHashMap<>();

    public WorkspaceService(WorkspaceEventsRepository workspaceEventsRepository, AssessmentRepository assessmentRepository) {
        this.workspaceEventsRepository = workspaceEventsRepository;
        this.assessmentRepository = assessmentRepository;
    }

    @Async
    public void createWorkspaceEventWithBuffer(String sessionId, String details, WorkspaceEventType eventType) {
        WorkspaceEvent codeChange = WorkspaceEvent.builder()
                .details(details)
                .eventType(eventType)
                .createdAt(Instant.now())
                .assessment(Assessment.builder().id(Integer.valueOf(sessionId)).build())
                .build();

        buffer.put(sessionId, codeChange);
    }

    @Async
    public void createWorkspaceEvent(String sessionId, String details, WorkspaceEventType eventType) {
        Assessment assessment = Assessment.builder().id(Integer.valueOf(sessionId)).build();
        workspaceEventsRepository.save(WorkspaceEvent.builder()
                .assessment(assessment)
                .details(details)
                .eventType(eventType)
                .createdAt(Instant.now())
                .build()
        );
    }


    public void endSession(String sessionId, EndSessionEvent event) {
        Assessment assessment = assessmentRepository.findById(Integer.valueOf(sessionId)).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found")
        );

        assessment.setNotes(event.getNotes());
        assessment.setCode(event.getCode());
        assessment.setCompleted(true);

        assessmentRepository.save(assessment);
    }

    @Scheduled(fixedRate = 2000)
    protected void flushBuffer() {
        workspaceEventsRepository.saveAll(buffer.values());
        buffer.clear();
    }

    public EventsResponse getReplayEvents(String sessionId, JwtAdmin user) {
        Assessment assessment = assessmentRepository.findById(Integer.valueOf(sessionId)).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        if (!assessment.getAdminId().equals(user.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assessment not owned by current user");
        }

        WorkspaceEvent[] events = workspaceEventsRepository.findByAssessmentOrderByCreatedAtAsc(assessment);
        return EventsResponse.builder()
                .events(events).assessment(assessment).build();

    }
}
