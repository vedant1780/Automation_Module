package com.example.hrm.payroll.service;

import com.example.hrm.payroll.dto.PayrollResponse;
import com.example.hrm.payroll.entity.Payroll;
import com.example.hrm.payroll.exception.PayslipNotFoundException;
import com.example.hrm.payroll.exception.ResourceNotFoundException;
import com.example.hrm.payroll.repository.PayrollRepository;
import com.example.hrm.payroll.repository.PayslipEmailRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final PayslipEmailRepository payslipEmailRepository;
    private final PayrollGenerationService payrollGenerationService;

    public PayrollService(
            PayrollRepository payrollRepository,
            PayslipEmailRepository payslipEmailRepository,
            PayrollGenerationService payrollGenerationService) {

        this.payrollRepository = payrollRepository;
        this.payslipEmailRepository = payslipEmailRepository;
        this.payrollGenerationService = payrollGenerationService;
    }

    // =========================================================
    // GET ALL PAYROLLS (paginated)
    // =========================================================

    public Page<PayrollResponse> getAllPayrolls(Pageable pageable) {
        return payrollRepository.findAll(pageable)
                .map(PayrollMapper::toResponse);
    }

    // =========================================================
    // GET PAYROLL BY ID
    // =========================================================

    public PayrollResponse getPayrollById(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found with id: " + id));
        return PayrollMapper.toResponse(payroll);
    }

    // =========================================================
    // GENERATE PAYROLL
    // =========================================================

    @Transactional
    public PayrollResponse generatePayroll(Long employeeId, int month, int year) {
        Payroll payroll = payrollGenerationService.generatePayroll(employeeId, month, year);
        return PayrollMapper.toResponse(payroll);
    }

    // =========================================================
    // GET PAYSLIP FILE (for view/download)
    // =========================================================

    public File getPayslipFile(Long payrollId) {

        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found with id: " + payrollId));

        String pdfPath = payroll.getPdfPath();

        if (pdfPath == null || pdfPath.isBlank()) {
            throw new PayslipNotFoundException(
                    "Payslip has not been generated yet for payroll ID: " + payrollId);
        }

        File pdfFile = new File(pdfPath);

        if (!pdfFile.exists() || !pdfFile.isFile()) {
            throw new PayslipNotFoundException(
                    "Payslip file is missing on disk for payroll ID: " + payrollId
                            + " (expected at: " + pdfPath + ")");
        }

        return pdfFile;
    }

    // =========================================================
    // DELETE PAYROLL
    // =========================================================

    @Transactional
    public void deletePayroll(Long payrollId) {

        if (!payrollRepository.existsById(payrollId)) {
            throw new ResourceNotFoundException("Payroll not found with id: " + payrollId);
        }

        payslipEmailRepository.deleteByPayrollId(payrollId);
        payrollRepository.deleteById(payrollId);
    }
}