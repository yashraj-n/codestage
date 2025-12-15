package com.yashrajn.codestageserver.models.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "workspace_events")
public class WorkspaceEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id")
    @JsonIgnore
    private Assessment assessment;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = Integer.MAX_VALUE)
    private WorkspaceEventType eventType;

    @Column(name = "details", length = Integer.MAX_VALUE)
    private String details;

    @Column(name = "created_at")
    private Instant createdAt;

}