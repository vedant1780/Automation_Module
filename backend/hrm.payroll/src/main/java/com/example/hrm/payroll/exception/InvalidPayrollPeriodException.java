package com.example.hrm.payroll.exception;

public class InvalidPayrollPeriodException extends RuntimeException {
    public InvalidPayrollPeriodException(String message) {
        super(message);
    }
}