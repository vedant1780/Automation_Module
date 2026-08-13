package com.example.hrm.payroll.repository;

import com.example.hrm.payroll.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalaryStructureRepository
        extends JpaRepository<SalaryStructure, Long> {
}
