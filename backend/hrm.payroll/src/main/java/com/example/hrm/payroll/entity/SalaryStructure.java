package com.example.hrm.payroll.entity;



import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
@Getter
@Entity
@Table(name = "salary_structures")
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    private String name;

    @Setter
    private BigDecimal basicSalary;

    @Setter
    private BigDecimal hra;

    @Setter
    private BigDecimal specialAllowance;

    @Setter
    private LocalDate effectiveFrom;

    @Setter
    private LocalDate effectiveTo;

}