package com.example.hrm.payroll.exception;

public class PayslipSendException extends RuntimeException {
    public PayslipSendException(String message, Throwable cause) {
        super(message, cause);
    }
}