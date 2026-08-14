package com.example.hrm.payroll.repository;

import com.example.hrm.payroll.entity.LeaveApplication;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveApplicationRepository
        extends JpaRepository<LeaveApplication, Long> {

    List<LeaveApplication> findByEmployeeId(Long employeeId);

    List<LeaveApplication> findByEmployeeIdAndStatus(
            Long employeeId,
            String status
    );
    @Transactional
    void deleteByEmployeeId(Long employeeId);
}