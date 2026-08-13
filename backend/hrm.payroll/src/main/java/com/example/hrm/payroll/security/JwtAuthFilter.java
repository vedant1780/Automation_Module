package com.example.hrm.payroll.security;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public JwtAuthFilter(JwtService jwtService) {

        this.jwtService = jwtService;
    }


    // =====================================================
    // FILTER
    // =====================================================

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {


        // =================================================
        // GET AUTHORIZATION HEADER
        // =================================================

        String authHeader =
                request.getHeader("Authorization");


        // =================================================
        // NO JWT TOKEN
        // =================================================

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);

            return;
        }


        try {

            // =================================================
            // EXTRACT TOKEN
            // =================================================

            String token =
                    authHeader.substring(7);


            // =================================================
            // VALIDATE TOKEN
            // =================================================

            if (!jwtService.isTokenValid(token)) {

                System.out.println(
                        "JWT token is invalid"
                );

                filterChain.doFilter(request, response);

                return;
            }


            // =================================================
            // EXTRACT USER DETAILS
            // =================================================

            String email =
                    jwtService.extractEmail(token);

            String role =
                    jwtService.extractRole(token);

            Long employeeId =
                    jwtService.extractEmployeeId(token);


            System.out.println(
                    "Authenticated user: " + email
            );

            System.out.println(
                    "Role: " + role
            );

            System.out.println(
                    "Employee ID: " + employeeId
            );


            // =================================================
            // CHECK IF ALREADY AUTHENTICATED
            // =================================================

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {


                // =================================================
                // CREATE AUTHORITY
                // =================================================

                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority(
                                "ROLE_" +
                                        role.toUpperCase()
                        );


                // =================================================
                // CREATE AUTHENTICATION
                // =================================================

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(authority)
                        );


                // =================================================
                // STORE EMPLOYEE ID
                // =================================================

                authentication.setDetails(
                        employeeId
                );


                // =================================================
                // SET SECURITY CONTEXT
                // =================================================

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authentication
                        );
            }


        } catch (Exception e) {

            System.out.println(
                    "JWT authentication failed: "
                            + e.getMessage()
            );
        }


        // =================================================
        // CONTINUE REQUEST
        // =================================================

        filterChain.doFilter(
                request,
                response
        );
    }
}
