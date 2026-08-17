package com.example.hrm.payroll.repository;

import com.example.hrm.payroll.entity.EmployeeSalary;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmployeeSalaryRepository
        extends JpaRepository<EmployeeSalary, Long> {

    @Query("""
        SELECT es
        FROM EmployeeSalary es
        WHERE es.employee.id = :employeeId
        AND es.effectiveFrom <= :endDate
        AND (
            es.effectiveTo IS NULL
            OR es.effectiveTo >= :startDate
        )
        ORDER BY es.effectiveFrom DESC
    """)
    List<EmployeeSalary> findActiveSalaryAssignments(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<EmployeeSalary> findByEmployeeIdOrderByEffectiveFromDesc(
            Long employeeId
    );

    Optional<EmployeeSalary>
    findFirstByEmployeeIdOrderByEffectiveFromDesc(
            Long employeeId
    );

    Optional<EmployeeSalary>
    findTopByEmployeeIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
            Long employeeId,
            LocalDate effectiveDate
    );

    @Transactional
    void deleteByEmployeeId(Long employeeId);

    @Transactional
    void deleteBySalaryStructureId(Long salaryStructureId);

    List<EmployeeSalary> findBySalaryStructureId(
            Long salaryStructureId
    );
}