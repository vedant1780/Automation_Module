package com.example.hrm.payroll.repository;

import com.example.hrm.payroll.entity.Payroll;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayrollRepository
        extends JpaRepository<Payroll, Long> {

    Optional<Payroll> findByEmployeeIdAndMonthAndYear(
            Long employeeId,
            int month,
            int year
    );
    List<Payroll> findByEmployeeId(
            Long employeeId
    );
    @Transactional
    void deleteByEmployeeId(Long employeeId);
}
