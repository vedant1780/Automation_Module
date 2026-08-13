package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.dto.PayslipEmailResponse;
import com.example.hrm.payroll.entity.Payroll;
import com.example.hrm.payroll.entity.PayslipEmail;
import com.example.hrm.payroll.repository.PayrollRepository;
import com.example.hrm.payroll.repository.PayslipEmailRepository;
import com.example.hrm.payroll.service.PayslipEmailService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payslip-emails")
public class PayslipEmailController {

    private final PayslipEmailRepository payslipEmailRepository;
    private final PayrollRepository payrollRepository;
    private final PayslipEmailService payslipEmailService;

    public PayslipEmailController(
            PayslipEmailRepository payslipEmailRepository,
            PayrollRepository payrollRepository,
            PayslipEmailService payslipEmailService) {

        this.payslipEmailRepository = payslipEmailRepository;
        this.payrollRepository = payrollRepository;
        this.payslipEmailService = payslipEmailService;
    }

    // ==========================================
    // SEND PAYSLIP EMAIL
    // ==========================================

    @PostMapping("/send/{payrollId}")
    public PayslipEmailResponse sendPayslip(
            @PathVariable Long payrollId) {

        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() ->
                        new RuntimeException("Payroll not found"));

        PayslipEmail email =
                payslipEmailService.sendPayslip(payroll);

        return toResponse(email);
    }


    // ==========================================
    // GET ALL EMAIL LOGS
    // ==========================================

    @GetMapping
    public List<PayslipEmailResponse> getAllEmailHistory() {

        return payslipEmailRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ==========================================
    // GET EMPLOYEE EMAIL LOGS
    // ==========================================

    @GetMapping("/employee/{employeeId}")
    public List<PayslipEmailResponse> getEmployeeEmailHistory(
            @PathVariable Long employeeId) {

        return payslipEmailRepository
                .findByEmployeeId(employeeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ==========================================
    // GET PAYROLL EMAIL LOGS
    // ==========================================

    @GetMapping("/payroll/{payrollId}")
    public List<PayslipEmailResponse> getPayrollEmailHistory(
            @PathVariable Long payrollId) {

        return payslipEmailRepository
                .findByPayrollId(payrollId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ==========================================
    // RESPONSE
    // ==========================================

    private PayslipEmailResponse toResponse(
            PayslipEmail email) {

        return new PayslipEmailResponse(
                email.getId(),
                email.getEmail(),
                email.getStatus(),
                email.getSentAt(),
                email.getErrorMessage()
        );
    }
}