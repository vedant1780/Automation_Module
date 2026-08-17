package com.example.hrm.payroll.exception;

public class PayslipNotFoundException extends RuntimeException {
    public PayslipNotFoundException(String message) {
        super(message);
    }
}