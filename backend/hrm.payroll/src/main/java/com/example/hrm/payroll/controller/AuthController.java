package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.LoginRequest;
import com.example.hrm.payroll.repository.EmployeeRepository;


import com.example.hrm.payroll.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;

    public AuthController(
            EmployeeRepository employeeRepository,
            JwtService jwtService) {

        this.employeeRepository = employeeRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        System.out.println("=================================");
        System.out.println("LOGIN REQUEST");
        System.out.println("Email: " + request.getEmail());
        System.out.println("=================================");

        // Validate request
        if (request.getEmail() == null ||
                request.getPassword() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Email and password are required");
        }

        // Find employee
        Employee employee = employeeRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        // Employee not found
        if (employee == null) {

            System.out.println("Employee NOT FOUND");

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }

        System.out.println("Employee found: " + employee.getName());
        System.out.println("Employee role: " + employee.getRole());

        // Check password
        if (employee.getPassword() == null ||
                !employee.getPassword()
                        .equals(request.getPassword())) {

            System.out.println("PASSWORD DOES NOT MATCH");

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }

        System.out.println("PASSWORD MATCHED");

        // Generate JWT
        String token = jwtService.generateToken(
                employee.getId(),
                employee.getEmail(),
                employee.getRole()
        );

        // Response
        Map<String, Object> response =
                new HashMap<>();

        response.put("message", "Login successful");
        response.put("token", token);
        response.put("id", employee.getId());
        response.put("employeeCode", employee.getEmployeeCode());
        response.put("name", employee.getName());
        response.put("email", employee.getEmail());
        response.put("department", employee.getDepartment());
        response.put("designation", employee.getDesignation());
        response.put("role", employee.getRole());

        return ResponseEntity.ok(response);
    }
}

