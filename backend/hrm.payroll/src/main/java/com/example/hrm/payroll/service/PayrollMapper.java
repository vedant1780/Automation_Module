package com.example.hrm.payroll.service;

import com.example.hrm.payroll.dto.PayrollResponse;
import com.example.hrm.payroll.entity.Payroll;

final class PayrollMapper {

    private PayrollMapper() {}

    static PayrollResponse toResponse(Payroll payroll) {
        return PayrollResponse.builder()
                .id(payroll.getId())
                .employeeId(payroll.getEmployee().getId())
                .employeeName(payroll.getEmployee().getName()) // adjust to your Employee entity's actual getter
                .month(payroll.getMonth())
                .year(payroll.getYear())
                .basicSalary(payroll.getBasicSalary())
                .hra(payroll.getHra())
                .specialAllowance(payroll.getSpecialAllowance())
                .grossSalary(payroll.getGrossSalary())
                .pf(payroll.getPf())
                .esi(payroll.getEsi())
                .professionalTax(payroll.getProfessionalTax())
                .totalDeductions(payroll.getTotalDeductions())
                .netSalary(payroll.getNetSalary())
                .pdfPath(payroll.getPdfPath())
                .build();
    }
}