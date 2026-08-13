package com.example.hrm.payroll.repository;
import com.example.hrm.payroll.entity.EmployeeSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface EmployeeSalaryRepository
        extends JpaRepository<EmployeeSalary, Long> {

    Optional<EmployeeSalary>
    findTopByEmployeeIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
            Long employeeId,
            LocalDate effectiveDate
    );
}