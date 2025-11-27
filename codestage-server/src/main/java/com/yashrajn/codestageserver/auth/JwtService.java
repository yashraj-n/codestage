package com.yashrajn.codestageserver.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final Algorithm algorithm;
    private final String issuer = "codestage";

    public JwtService(@Value("${jwt.secret}") String jwtSecret) {
        this.algorithm = Algorithm.HMAC256(jwtSecret);
    }

    public String generateJwtToken(String id) {
        return JWT.create()
                .withIssuer(issuer)
                .withSubject(id)
                .sign(algorithm);
    }

    public String validateJwtToken(String token) throws JWTVerificationException {
        DecodedJWT decoded = JWT.require(algorithm)
                .withIssuer(issuer)
                .build()
                .verify(token);
        return decoded.getSubject();
    }
}

