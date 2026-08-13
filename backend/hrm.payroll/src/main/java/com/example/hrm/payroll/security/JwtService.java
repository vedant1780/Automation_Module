package com.example.hrm.payroll.security;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "VGhpc0lzQVN1cGVyTG9uZ1NlY3JldEtleUZvckhSTVMyMDI2";

    private static final long EXPIRATION_TIME =
            1000L * 60 * 60 * 24;


    private SecretKey getSigningKey() {

        byte[] keyBytes =
                Decoders.BASE64.decode(SECRET_KEY);

        return Keys.hmacShaKeyFor(keyBytes);
    }


    // =====================================================
    // GENERATE TOKEN
    // =====================================================

    public String generateToken(
            Long employeeId,
            String email,
            String role) {

        return Jwts.builder()

                .subject(email)

                .claim("employeeId", employeeId)

                .claim("role", role)

                .issuedAt(new Date())

                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION_TIME
                        )
                )

                .signWith(getSigningKey())

                .compact();
    }


    // =====================================================
    // EXTRACT EMAIL
    // =====================================================

    public String extractEmail(String token) {

        return extractAllClaims(token)
                .getSubject();
    }


    // =====================================================
    // EXTRACT EMPLOYEE ID
    // =====================================================

    public Long extractEmployeeId(String token) {

        Number employeeId =
                extractAllClaims(token)
                        .get("employeeId", Number.class);
        return employeeId.longValue();
    }


    // =====================================================
    // EXTRACT ROLE
    // =====================================================

    public String extractRole(String token) {

        return extractAllClaims(token)
                .get("role", String.class);
    }


    // =====================================================
    // VALIDATE TOKEN
    // =====================================================

    public boolean isTokenValid(String token) {

        try {

            extractAllClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }


    // =====================================================
    // CLAIMS
    // =====================================================

    private Claims extractAllClaims(String token) {

        return Jwts.parser()

                .verifyWith(getSigningKey())

                .build()

                .parseSignedClaims(token)

                .getPayload();
    }
}

