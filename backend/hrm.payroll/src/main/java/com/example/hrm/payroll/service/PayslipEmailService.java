package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.Payroll;
import com.example.hrm.payroll.entity.PayslipEmail;
import com.example.hrm.payroll.entity.PayslipEmailStatus;
import com.example.hrm.payroll.exception.InvalidPayslipRequestException;
import com.example.hrm.payroll.exception.PayslipSendException;
import com.example.hrm.payroll.repository.PayslipEmailRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PayslipEmailService {

    private final PayslipEmailRepository payslipEmailRepository;
    private final PayslipMailSender payslipMailSender;

    public PayslipEmailService(
            PayslipEmailRepository payslipEmailRepository,
            PayslipMailSender payslipMailSender) {

        this.payslipEmailRepository = payslipEmailRepository;
        this.payslipMailSender = payslipMailSender;
    }

    @Transactional
    public PayslipEmail sendPayslip(Payroll payroll) {

        validate(payroll);

        Employee employee = payroll.getEmployee();

        payslipEmailRepository
                .findTopByPayrollIdAndStatusOrderBySentAtDesc(payroll.getId(), PayslipEmailStatus.SENT)
                .ifPresent(existing -> {
                    throw new InvalidPayslipRequestException(
                            "Payslip already sent for payroll ID: " + payroll.getId()
                                    + " at " + existing.getSentAt());
                });

        PayslipEmail payslipEmail = new PayslipEmail();
        payslipEmail.setPayroll(payroll);
        payslipEmail.setEmployeeId(employee.getId());
        payslipEmail.setEmail(employee.getEmail());
        payslipEmail.setStatus(PayslipEmailStatus.PENDING);

        payslipEmailRepository.saveAndFlush(payslipEmail);

        try {
            payslipMailSender.send(employee.getEmail(), payroll.getPdfPath(), payroll);

            payslipEmail.setStatus(PayslipEmailStatus.SENT);
            payslipEmail.setSentAt(LocalDateTime.now());
            payslipEmail.setErrorMessage(null);

        } catch (Exception e) {
            payslipEmail.setStatus(PayslipEmailStatus.FAILED);
            payslipEmail.setErrorMessage(truncate(e.getMessage(), 1000));
            payslipEmailRepository.saveAndFlush(payslipEmail);

            throw new PayslipSendException(
                    "Failed to send payslip email for payroll ID: " + payroll.getId(), e);
        }

        return payslipEmailRepository.saveAndFlush(payslipEmail);
    }

    private void validate(Payroll payroll) {
        if (payroll == null) {
            throw new InvalidPayslipRequestException("Payroll cannot be null");
        }
        if (payroll.getId() == null) {
            throw new InvalidPayslipRequestException("Payroll ID cannot be null");
        }

        Employee employee = payroll.getEmployee();
        if (employee == null) {
            throw new InvalidPayslipRequestException(
                    "Employee not found for payroll ID: " + payroll.getId());
        }
        if (employee.getEmail() == null || employee.getEmail().isBlank()) {
            throw new InvalidPayslipRequestException(
                    "Employee email not found for payroll ID: " + payroll.getId());
        }
        if (payroll.getPdfPath() == null || payroll.getPdfPath().isBlank()) {
            throw new InvalidPayslipRequestException(
                    "Payslip PDF not generated yet for payroll ID: " + payroll.getId());
        }
    }

    private String truncate(String message, int max) {
        if (message == null) return null;
        return message.length() > max ? message.substring(0, max) : message;
    }
}