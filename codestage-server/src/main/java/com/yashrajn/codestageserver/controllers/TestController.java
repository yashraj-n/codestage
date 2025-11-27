package com.yashrajn.codestageserver.controllers;

import com.yashrajn.codestageserver.auth.JwtUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @GetMapping("/real")
    public Object test(@AuthenticationPrincipal JwtUser user) {
        return user;
    }
}
