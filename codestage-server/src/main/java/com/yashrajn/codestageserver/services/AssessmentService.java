package com.yashrajn.codestageserver.services;

import com.yashrajn.codestageserver.auth.JwtUser;
import com.yashrajn.codestageserver.models.dao.CreateAssessmentDTO;
import com.yashrajn.codestageserver.models.entity.Assessment;
import com.yashrajn.codestageserver.repository.AssessmentRepository;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Service
public class AssessmentService {
    private static final Logger log = LoggerFactory.getLogger(AssessmentService.class);
    private final AssessmentRepository repo;
    private final MailService mailService;


    AssessmentService(AssessmentRepository repo, MailService mailService) {
        this.repo = repo;
        this.mailService = mailService;
    }

    @Transactional
    public void createAssessment(CreateAssessmentDTO payload, JwtUser user) {
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
            mailService.sendEmailToCandidate(payload, user);
            log.info("Email Sent to Candidate: {}", payload.candidateEmail());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to Read Template: " + e.getMessage());
        } catch (MessagingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send Email: " + e.getMessage());
        }
    }

    public List<Assessment> getAllAssessments(String userId) {
        return repo.findByAdminId(userId);
    }
}
