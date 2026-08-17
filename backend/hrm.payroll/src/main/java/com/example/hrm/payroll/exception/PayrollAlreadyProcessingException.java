package com.example.hrm.payroll.exception;


public class PayrollAlreadyProcessingException extends RuntimeException {
    public PayrollAlreadyProcessingException(String message) {
        super(message);
    }
}