package com.yashrajn.codestageserver.controllers;

import com.yashrajn.codestageserver.auth.JwtUser;
import com.yashrajn.codestageserver.models.dao.CreateAssessmentDTO;
import com.yashrajn.codestageserver.models.entity.Assessment;
import com.yashrajn.codestageserver.repository.AssessmentRepository;
import com.yashrajn.codestageserver.services.AssessmentService;
import com.yashrajn.codestageserver.services.MailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assessment")
@Validated
public class AssessmentController {

    private final AssessmentService assessmentService;

    AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping
    public ResponseEntity<String> createAssessment(
            @RequestBody CreateAssessmentDTO createAssessmentDTO,
            @AuthenticationPrincipal JwtUser user
    ) {
        assessmentService.createAssessment(createAssessmentDTO, user);
        return new ResponseEntity<>("{}", HttpStatus.CREATED);
    }

    @GetMapping
    public List<Assessment> getAllAssessments(@AuthenticationPrincipal JwtUser user) {
        return assessmentService.getAllAssessments(user.getUserId());
    }
}
