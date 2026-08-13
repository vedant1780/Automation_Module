package com.example.hrm.payroll.dto;

import java.time.LocalDateTime;

public class PayslipEmailDTO {

    private Long id;
    private String email;
    private String status;
    private LocalDateTime sentAt;
    private String errorMessage;

    public PayslipEmailDTO(
            Long id,
            String email,
            String status,
            LocalDateTime sentAt,
            String errorMessage) {

        this.id = id;
        this.email = email;
        this.status = status;
        this.sentAt = sentAt;
        this.errorMessage = errorMessage;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}