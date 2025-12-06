package com.yashrajn.codestageserver.auth;

import com.yashrajn.codestageserver.utils.JsonSerializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtCandidate implements JsonSerializable {
    private String candidateEmail;
    private String candidateName;
}
