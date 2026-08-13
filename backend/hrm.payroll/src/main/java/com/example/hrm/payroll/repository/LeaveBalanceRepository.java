package com.example.hrm.payroll.repository;

import com.example.hrm.payroll.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeaveBalanceRepository
        extends JpaRepository<LeaveBalance, Long> {

    Optional<LeaveBalance> findByEmployeeIdAndYear(
            Long employeeId,
            int year
    );
}