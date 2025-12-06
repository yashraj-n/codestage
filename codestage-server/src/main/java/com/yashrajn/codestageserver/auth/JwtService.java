package com.yashrajn.codestageserver.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.yashrajn.codestageserver.utils.JsonSerializable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final Algorithm algorithm;
    private final String issuer = "codestage";
    private final String userClaimsKey = "user";

    public JwtService(@Value("${jwt.secret}") String jwtSecret) {
        this.algorithm = Algorithm.HMAC256(jwtSecret);
    }

    private DecodedJWT decodeJwtToken(String token) {
        return JWT.require(algorithm)
                .withIssuer(issuer)
                .build()
                .verify(token);
    }

    private String generateJwt(String subject, String claimsKey, String claimsValue) {
        return JWT
                .create()
                .withIssuer(issuer)
                .withSubject(subject)
                .withClaim(claimsKey, claimsValue)
                .sign(algorithm);
    }

    public String generateUserJwtToken(String id, JwtAdmin user) {
        return generateJwt(user.getUserId(), userClaimsKey, user.toJson());
    }

    public JwtAdmin validateUserJwtToken(String token) throws JWTVerificationException {
        DecodedJWT decoded = decodeJwtToken(token);
        String claimsJson = decoded.getClaim("user").asString();
        return JsonSerializable.fromJson(claimsJson, JwtAdmin.class);
    }

    public String generateCandidateJwtToken(String sessionId, JwtCandidate candidate) {
        return generateJwt(sessionId,"candidate", candidate.toJson());
    }


}

