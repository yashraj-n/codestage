package com.yashrajn.codestageserver.models.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record CreateAssessmentDTO(
        @NotNull String candidateName,
        @Email @NotNull String candidateEmail,
        @NotNull String assessmentNotes
) {
}
