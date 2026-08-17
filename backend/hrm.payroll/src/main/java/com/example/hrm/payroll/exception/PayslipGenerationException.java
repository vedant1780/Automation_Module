package com.example.hrm.payroll.exception;

public class PayslipGenerationException extends RuntimeException {
    public PayslipGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}