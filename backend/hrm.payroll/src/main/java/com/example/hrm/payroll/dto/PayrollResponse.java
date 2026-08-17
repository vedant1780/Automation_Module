package com.example.hrm.payroll.dto;


import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class PayrollResponse {
    Long id;
    Long employeeId;
    String employeeName;
    int month;
    int year;
    BigDecimal basicSalary;
    BigDecimal hra;
    BigDecimal specialAllowance;
    BigDecimal grossSalary;
    BigDecimal pf;
    BigDecimal esi;
    BigDecimal professionalTax;
    BigDecimal totalDeductions;
    BigDecimal netSalary;
    String pdfPath;
}