package com.example.hrm.payroll.exception;


public class InvalidPayslipRequestException extends RuntimeException {
    public InvalidPayslipRequestException(String message) {
        super(message);
    }
}