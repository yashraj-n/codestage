package com.yashrajn.codestageserver.models.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "code_changes")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeChange {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id")
    private Assessment assessment;

    @Column(name = "code", length = Integer.MAX_VALUE)
    private String code;

    @Column(name = "created_at")
    private Instant createdAt;

}