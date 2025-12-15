package com.yashrajn.codestageserver.repository;

import com.yashrajn.codestageserver.models.entity.Assessment;
import com.yashrajn.codestageserver.models.entity.WorkspaceEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceEventsRepository extends JpaRepository<WorkspaceEvent, Integer> {
    WorkspaceEvent[] findByAssessmentOrderByCreatedAtAsc(Assessment assessment);
}
