package com.yashrajn.codestageserver.controllers;

import com.yashrajn.codestageserver.auth.JwtAdmin;
import com.yashrajn.codestageserver.models.dto.CreateAssessmentDTO;
import com.yashrajn.codestageserver.models.entity.Assessment;
import com.yashrajn.codestageserver.services.AssessmentService;
import org.springframework.http.HttpStatus;
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
            @AuthenticationPrincipal JwtAdmin user
    ) {
        assessmentService.createAssessment(createAssessmentDTO, user);
        return new ResponseEntity<>("{}", HttpStatus.CREATED);
    }

    @GetMapping
    public List<Assessment> getAllAssessments(@AuthenticationPrincipal JwtAdmin user) {
        return assessmentService.getAllAssessments(user.getUserId());
    }
}
