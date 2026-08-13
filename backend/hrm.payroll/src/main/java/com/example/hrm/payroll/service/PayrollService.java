package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.Payroll;
import com.example.hrm.payroll.repository.PayrollRepository;
import com.example.hrm.payroll.repository.PayslipEmailRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final PayslipEmailRepository payslipEmailRepository;

    public PayrollService(
            PayrollRepository payrollRepository,
            PayslipEmailRepository payslipEmailRepository) {

        this.payrollRepository = payrollRepository;
        this.payslipEmailRepository = payslipEmailRepository;
    }

    @Transactional
    public void deletePayroll(Long payrollId) {

        // Check payroll exists
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() ->
                        new RuntimeException("Payroll not found"));

        // Delete email logs first
        payslipEmailRepository.deleteByPayrollId(payrollId);

        // Delete payroll
        payrollRepository.delete(payroll);
    }
}