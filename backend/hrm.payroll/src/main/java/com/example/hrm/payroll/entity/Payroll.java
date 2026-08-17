package com.example.hrm.payroll.entity;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
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
        },
        indexes = {
                @Index(name = "idx_payroll_period", columnList = "year, month")
        }
)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "pdf_path")
    private String pdfPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

    @Column(precision = 12, scale = 2)
    private BigDecimal pf;

    @Column(precision = 12, scale = 2)
    private BigDecimal esi;

    @Column(name = "professional_tax", precision = 12, scale = 2)
    private BigDecimal professionalTax;

    @Column(name = "total_deductions", precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "basic_salary", precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(precision = 12, scale = 2)
    private BigDecimal hra;

    @Column(name = "special_allowance", precision = 12, scale = 2)
    private BigDecimal specialAllowance;

    @Column(name = "gross_salary", precision = 12, scale = 2)
    private BigDecimal grossSalary;

    // NOTE: consider removing this in favor of totalDeductions if they
    // represent the same value. Kept here only if it means something
    // distinct (e.g. itemized vs computed total).
    @Column(precision = 12, scale = 2)
    private BigDecimal deductions;

    @Column(name = "net_salary", precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Version
    private Long version;

    @PrePersist
    @PreUpdate
    private void validatePeriod() {
        if (month < 1 || month > 12) {
            throw new IllegalStateException("month must be between 1 and 12, got: " + month);
        }
        if (year < 2000 || year > 2100) {
            throw new IllegalStateException("year out of acceptable range, got: " + year);
        }
    }
}