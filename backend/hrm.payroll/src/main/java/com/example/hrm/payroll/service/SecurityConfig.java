package com.example.hrm.payroll.service;

import com.example.hrm.payroll.security.JwtAuthFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter) {

        this.jwtAuthFilter = jwtAuthFilter;
    }


    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // -------------------------------------------------
                // Disable CSRF
                // -------------------------------------------------

                .csrf(csrf -> csrf.disable())


                // -------------------------------------------------
                // Enable CORS
                // -------------------------------------------------

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )


                // -------------------------------------------------
                // JWT = Stateless
                // -------------------------------------------------

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // -------------------------------------------------
                // URL PERMISSIONS
                // -------------------------------------------------

                .authorizeHttpRequests(auth -> auth

                        // LOGIN
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()


                        // OPTIONS / CORS
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()


                        // -------------------------------------------------
                        // EMPLOYEES
                        // -------------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/employees/**"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/employees/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "HR"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/employees/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "HR"
                        )

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/employees/**"
                        ).hasRole(
                                "ADMIN"
                        )


                        // -------------------------------------------------
                        // SALARY STRUCTURES
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/salary-structures/**"
                        ).authenticated()


                        // -------------------------------------------------
                        // EMPLOYEE SALARY
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/employee-salary/**"
                        ).authenticated()


                        // -------------------------------------------------
                        // ATTENDANCE
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/attendance/**"
                        ).authenticated()


                        // -------------------------------------------------
                        // LEAVE
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/leaves/**"
                        ).authenticated()


                        // -------------------------------------------------
                        // PAYROLL
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/payroll/**"
                        ).authenticated()


                        // -------------------------------------------------
                        // PAYSLIP EMAILS
                        // -------------------------------------------------

                        .requestMatchers(
                                "/api/payslip-emails/**"
                        ).authenticated()


                        // -------------------------------------------------
                        // EVERYTHING ELSE
                        // -------------------------------------------------

                        .anyRequest().authenticated()
                );


        // =====================================================
        // IMPORTANT
        // REGISTER JWT FILTER
        // =====================================================

        http.addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
        );


        return http.build();
    }


    // =====================================================
    // CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173"
                )
        );


        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );


        configuration.setAllowedHeaders(
                List.of("*")
        );


        configuration.setAllowCredentials(false);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }
}
