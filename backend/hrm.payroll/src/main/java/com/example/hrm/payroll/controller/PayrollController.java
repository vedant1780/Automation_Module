package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.dto.PayrollResponse;
import com.example.hrm.payroll.service.PayrollService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.File;

@RestController
@RequestMapping("/api/payrolls")
@Validated
@CrossOrigin(origins = "http://localhost:5173")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    // =========================================================
    // GET ALL PAYROLLS (paginated)
    // =========================================================

    @GetMapping
    public ResponseEntity<Page<PayrollResponse>> getAllPayrolls(Pageable pageable) {
        return ResponseEntity.ok(payrollService.getAllPayrolls(pageable));
    }

    // =========================================================
    // GET PAYROLL BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<PayrollResponse> getPayrollById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.getPayrollById(id));
    }

    // =========================================================
    // GENERATE PAYROLL
    // =========================================================

    @PostMapping("/generate/{employeeId}")
    public ResponseEntity<PayrollResponse> generatePayroll(
            @PathVariable Long employeeId,
            @RequestParam @Min(1) @Max(12) int month,
            @RequestParam @Min(2000) @Max(2100) int year,
            UriComponentsBuilder uriBuilder) {

        PayrollResponse payroll = payrollService.generatePayroll(employeeId, month, year);

        return ResponseEntity
                .created(uriBuilder.path("/api/payrolls/{id}").buildAndExpand(payroll.getId()).toUri())
                .body(payroll);
    }

    // =========================================================
    // VIEW PAYSLIP (inline, opens in browser tab)
    // =========================================================

    @GetMapping("/{id}/payslip/view")
    public ResponseEntity<Resource> viewPayslip(@PathVariable Long id) {
        File pdfFile = payrollService.getPayslipFile(id);
        Resource resource = new FileSystemResource(pdfFile);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + pdfFile.getName() + "\"")
                .contentLength(pdfFile.length())
                .body(resource);
    }

    // =========================================================
    // DOWNLOAD PAYSLIP (forces download)
    // =========================================================

    @GetMapping("/{id}/payslip/download")
    public ResponseEntity<Resource> downloadPayslip(@PathVariable Long id) {
        File pdfFile = payrollService.getPayslipFile(id);
        Resource resource = new FileSystemResource(pdfFile);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pdfFile.getName() + "\"")
                .contentLength(pdfFile.length())
                .body(resource);
    }

    // =========================================================
    // DELETE PAYROLL
    // =========================================================

    @DeleteMapping("/{payrollId}")
    public ResponseEntity<Void> deletePayroll(@PathVariable Long payrollId) {
        payrollService.deletePayroll(payrollId);
        return ResponseEntity.noContent().build();
    }
}