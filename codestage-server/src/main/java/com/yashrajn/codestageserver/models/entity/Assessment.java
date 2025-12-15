package com.yashrajn.codestageserver.models.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "assessments")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "completed")
    private Boolean completed;

    @Size(max = 255)
    @Column(name = "candidate_name")
    private String candidateName;

    @Size(max = 255)
    @Column(name = "candidate_email")
    private String candidateEmail;

    @Column(name = "invite_notes", length = Integer.MAX_VALUE)
    private String inviteNotes;

    @Size(max = 255)
    @Column(name = "admin_id")
    private String adminId;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "code", length = Integer.MAX_VALUE)
    private String code;

    @Column(name = "notes", length = Integer.MAX_VALUE)
    private String notes;

}