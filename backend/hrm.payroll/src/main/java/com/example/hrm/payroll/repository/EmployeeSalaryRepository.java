package com.example.hrm.payroll.repository;
import com.example.hrm.payroll.entity.EmployeeSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmployeeSalaryRepository
        extends JpaRepository<EmployeeSalary, Long> {

    Optional<EmployeeSalary>
    findTopByEmployeeIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
            Long employeeId,
            LocalDate effectiveDate
    );
    // Get all salary assignments of an employee
    List<EmployeeSalary> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId );
    // Get latest salary assignment of an employee
    Optional<EmployeeSalary> findFirstByEmployeeIdOrderByEffectiveFromDesc( Long employeeId );
}