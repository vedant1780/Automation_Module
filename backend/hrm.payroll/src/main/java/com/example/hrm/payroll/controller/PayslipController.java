package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.Payroll;
import com.example.hrm.payroll.repository.PayrollRepository;
import com.example.hrm.payroll.service.PayslipService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "http://localhost:5173")
public class PayslipController {

    private final PayrollRepository payrollRepository;
    private final PayslipService payslipService;

    public PayslipController(
            PayrollRepository payrollRepository,
            PayslipService payslipService) {

        this.payrollRepository = payrollRepository;
        this.payslipService = payslipService;
    }

    // ==========================================================
    // VIEW PAYSLIP
    // ==========================================================

    @GetMapping("/{payrollId}/payslip/view")
    public ResponseEntity<byte[]> viewPayslip(
            @PathVariable Long payrollId) {

        Payroll payroll = payrollRepository
                .findById(payrollId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payroll not found with ID: "
                                        + payrollId));

        byte[] pdf =
                payslipService.generatePayslip(payroll);

        String fileName =
                "Payslip_"
                        + payroll.getEmployee().getEmployeeCode()
                        + "_"
                        + payroll.getMonth()
                        + "_"
                        + payroll.getYear()
                        + ".pdf";

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + fileName + "\""
                )
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    // ==========================================================
    // DOWNLOAD PAYSLIP
    // ==========================================================

    @GetMapping("/{payrollId}/payslip/download")
    public ResponseEntity<byte[]> downloadPayslip(
            @PathVariable Long payrollId) {

        Payroll payroll = payrollRepository
                .findById(payrollId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payroll not found with ID: "
                                        + payrollId));

        byte[] pdf =
                payslipService.generatePayslip(payroll);

        String fileName =
                "Payslip_"
                        + payroll.getEmployee().getEmployeeCode()
                        + "_"
                        + payroll.getMonth()
                        + "_"
                        + payroll.getYear()
                        + ".pdf";

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\""
                )
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    // ==========================================================
    // REGENERATE PAYSLIP
    // ==========================================================

    @PostMapping("/{payrollId}/payslip/regenerate")
    public ResponseEntity<String> regeneratePayslip(
            @PathVariable Long payrollId) {

        Payroll payroll = payrollRepository
                .findById(payrollId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payroll not found with ID: "
                                        + payrollId));

        payslipService.generatePayslip(payroll);

        return ResponseEntity.ok(
                "Payslip regenerated successfully"
        );
    }
}