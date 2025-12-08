package com.yashrajn.codestageserver.controllers;

import com.yashrajn.codestageserver.auth.JwtAdmin;
import com.yashrajn.codestageserver.services.CodeExecutionService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {
    private final CodeExecutionService test;

    public AdminController(CodeExecutionService test) {
        this.test = test;
    }

    @GetMapping("/me")
    public JwtAdmin getAdmin(@AuthenticationPrincipal JwtAdmin user) {
        return user;
    }


}
