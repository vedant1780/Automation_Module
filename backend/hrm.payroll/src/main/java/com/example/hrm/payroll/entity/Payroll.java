package com.example.hrm.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Entity
@Table(
        name = "payroll",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_payroll_employee_period",
                        columnNames = {
                                "employee_id",
                                "month",
                                "year"
                        }
                )
        }
)
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(name = "pdf_path")
    private String pdfPath;

    @Setter
    @ManyToOne
    @JoinColumn(
            name = "employee_id",
            nullable = false
    )
    private Employee employee;

    @Setter
    private int month;

    @Setter
    private int year;

    @Setter
    private BigDecimal pf;

    @Setter
    private BigDecimal esi;

    @Setter
    private BigDecimal professionalTax;

    @Setter
    private BigDecimal totalDeductions;

    @Setter
    private BigDecimal basicSalary;

    @Setter
    private BigDecimal hra;

    @Setter
    private BigDecimal specialAllowance;

    @Setter
    private BigDecimal grossSalary;

    @Setter
    private BigDecimal deductions;

    @Setter
    private BigDecimal netSalary;
}

