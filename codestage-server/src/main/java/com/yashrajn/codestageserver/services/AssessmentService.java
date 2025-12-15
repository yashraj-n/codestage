package com.yashrajn.codestageserver.services;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.yashrajn.codestageserver.auth.JwtAdmin;
import com.yashrajn.codestageserver.auth.JwtCandidate;
import com.yashrajn.codestageserver.auth.JwtService;
import com.yashrajn.codestageserver.models.dto.CreateAssessmentRequest;
import com.yashrajn.codestageserver.models.entity.Assessment;
import com.yashrajn.codestageserver.repository.AssessmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;


@Service
public class AssessmentService {
    private static final Logger log = LoggerFactory.getLogger(AssessmentService.class);
    private final AssessmentRepository repo;
    private final MailService mailService;
    private final JwtService jwtService;
    public static final Pattern VALID_EMAIL_ADDRESS_REGEX =
            Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE);


    AssessmentService(AssessmentRepository repo, MailService mailService, JwtService jwtService) {
        this.repo = repo;
        this.mailService = mailService;
        this.jwtService = jwtService;
    }

    @Transactional
    public void createAssessment(CreateAssessmentRequest payload, JwtAdmin user) {
        boolean isValidEmail = VALID_EMAIL_ADDRESS_REGEX.matcher(payload.candidateEmail()).matches();
        if (!isValidEmail) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Email Address");
        }
        Assessment assessment = Assessment.builder()
                .adminId(user.getUserId())
                .candidateName(payload.candidateName())
                .candidateEmail(payload.candidateEmail())
                .inviteNotes(payload.assessmentNotes())
                .completed(false)
                .createdAt(Instant.now())
                .build();

        repo.save(assessment);
        log.info("Created Assessment: {}", assessment);
        try {
            mailService.sendEmailToCandidate(payload, user, String.valueOf(assessment.getId()));
            log.info("Email Sent to Candidate: {}", payload.candidateEmail());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to Read Template: " + e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send Email: " + e.getMessage());
        }
    }

    public List<Assessment> getAllAssessments(String userId) {
        return repo.findByAdminIdOrderByCreatedAtDesc(userId);
    }

    public String createAssessmentJoinToken(String sessionId, JwtAdmin user) {
        Optional<Assessment> owned = repo.findById(Integer.valueOf(sessionId));

        if (owned.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found");
        }

        if (!Objects.equals(owned.get().getAdminId(), user.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assessment not owned by current user");
        }

        return jwtService.generateCandidateJwtToken(sessionId, JwtCandidate.builder()
                .sessionId(sessionId)
                .email(user.getEmail())
                .name(user.getName())
                .isAdmin(true
                ).build());

    }

    public JwtCandidate checkCandidateToken(String authorization) {
        try {
            authorization = authorization.replace("Bearer ", "");
            JwtCandidate candidate = jwtService.validateCandidateJwtToken(authorization);
            Assessment assessment = repo.findById(Integer.valueOf(candidate.getSessionId())).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment now found"));
            if (assessment.getCompleted()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assessment already completed");
            }
            return candidate;
        } catch (JWTVerificationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or Expired JWT token");
        }
    }

}
