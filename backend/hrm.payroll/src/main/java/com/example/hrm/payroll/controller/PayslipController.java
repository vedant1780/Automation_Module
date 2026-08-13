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
public class PayslipController {

    private final PayrollRepository payrollRepository;
    private final PayslipService payslipService;

    public PayslipController(
            PayrollRepository payrollRepository,
            PayslipService payslipService) {

        this.payrollRepository = payrollRepository;
        this.payslipService = payslipService;
    }

    // VIEW / PRINT payslip
    @GetMapping("/{payrollId}/payslip")
    public ResponseEntity<byte[]> generatePayslip(
            @PathVariable Long payrollId) {

        Payroll payroll = payrollRepository
                .findById(payrollId)
                .orElseThrow(() ->
                        new RuntimeException("Payroll not found"));

        byte[] pdf =
                payslipService.generatePayslip(payroll);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=payslip-" + payrollId + ".pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    // DOWNLOAD payslip
    @GetMapping("/{payrollId}/payslip/download")
    public ResponseEntity<byte[]> downloadPayslip(
            @PathVariable Long payrollId) {

        Payroll payroll = payrollRepository
                .findById(payrollId)
                .orElseThrow(() ->
                        new RuntimeException("Payroll not found"));

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
}