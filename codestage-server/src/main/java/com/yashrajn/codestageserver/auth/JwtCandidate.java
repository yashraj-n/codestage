package com.yashrajn.codestageserver.auth;

import com.yashrajn.codestageserver.utils.JsonSerializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.Principal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtCandidate implements JsonSerializable, Principal {
    private String email;
    private String name;
    private Boolean isAdmin;
    private String sessionId;
}
