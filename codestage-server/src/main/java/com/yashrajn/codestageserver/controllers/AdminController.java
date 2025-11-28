package com.yashrajn.codestageserver.controllers;

import com.yashrajn.codestageserver.auth.JwtUser;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {
    @GetMapping("/me")
    public JwtUser getAdmin(@AuthenticationPrincipal JwtUser user) {
        return user;
    }
}
