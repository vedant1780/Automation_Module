package com.example.hrm.payroll.repository;

import com.example.hrm.payroll.entity.PayslipEmail;
import com.example.hrm.payroll.entity.PayslipEmailStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipEmailRepository
        extends JpaRepository<PayslipEmail, Long> {

    List<PayslipEmail> findByPayrollId(Long payrollId);

    List<PayslipEmail> findByEmployeeId(Long employeeId);

    @Modifying
    @Transactional
    @Query("DELETE FROM PayslipEmail p WHERE p.payroll.id = :payrollId")
    void deleteByPayrollId(Long payrollId);
    Optional<PayslipEmail> findByPayrollIdAndStatus(Long payrollId, String status );
    @Transactional
    void deleteByEmployeeId(Long employeeId);
    Optional<PayslipEmail> findTopByPayrollIdAndStatusOrderBySentAtDesc(Long payrollId, PayslipEmailStatus status);
}