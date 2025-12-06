package com.yashrajn.codestageserver.auth;

import com.yashrajn.codestageserver.utils.JsonSerializable;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Schema(description = "User info stored in JWT")
public class JwtAdmin implements JsonSerializable {
    @Schema(description = "User ID")
    @NotNull
    private String userId;

    @Schema(description = "Full name of User")
    @NotNull
    private String name;

    @Schema(description = "Email of User")
    @NotNull
    private String email;

    @Schema(description = "Photo URL of User")
    @NotNull
    private String photoUrl;
}
