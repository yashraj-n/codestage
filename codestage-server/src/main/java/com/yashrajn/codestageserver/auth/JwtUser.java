package com.yashrajn.codestageserver.auth;

import com.yashrajn.codestageserver.utils.JsonSerializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class JwtUser {
    private String userId;

}
