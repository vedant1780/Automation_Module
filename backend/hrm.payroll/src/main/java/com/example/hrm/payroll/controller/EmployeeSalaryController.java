package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.EmployeeSalary;
import com.example.hrm.payroll.entity.SalaryStructure;
import com.example.hrm.payroll.repository.EmployeeRepository;
import com.example.hrm.payroll.repository.EmployeeSalaryRepository;
import com.example.hrm.payroll.repository.SalaryStructureRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/employee-salary")
public class EmployeeSalaryController {

    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeSalaryRepository employeeSalaryRepository;

    public EmployeeSalaryController(
            EmployeeRepository employeeRepository,
            SalaryStructureRepository salaryStructureRepository,
            EmployeeSalaryRepository employeeSalaryRepository) {

        this.employeeRepository = employeeRepository;
        this.salaryStructureRepository = salaryStructureRepository;
        this.employeeSalaryRepository = employeeSalaryRepository;
    }

    // =====================================================
    // GET ALL EMPLOYEE SALARY ASSIGNMENTS
    // =====================================================

    @GetMapping
    public List<EmployeeSalary> getAllEmployeeSalaries() {

        return employeeSalaryRepository.findAll();
    }


    // =====================================================
    // GET SALARY ASSIGNMENT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public EmployeeSalary getEmployeeSalaryById(
            @PathVariable Long id) {

        return employeeSalaryRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee salary assignment not found"
                        ));
    }


    // =====================================================
    // ASSIGN SALARY TO EMPLOYEE
    // =====================================================

    @PostMapping("/{employeeId}/{salaryStructureId}")
    public EmployeeSalary assignSalary(
            @PathVariable Long employeeId,
            @PathVariable Long salaryStructureId,
            @RequestParam LocalDate effectiveFrom) {

        // Find employee
        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found"
                        ));


        // Find salary structure
        SalaryStructure salaryStructure =
                salaryStructureRepository
                        .findById(salaryStructureId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found"
                                ));


        // Create assignment
        EmployeeSalary employeeSalary =
                new EmployeeSalary();

        employeeSalary.setEmployee(employee);

        employeeSalary.setSalaryStructure(
                salaryStructure
        );

        employeeSalary.setEffectiveFrom(
                effectiveFrom
        );


        // Save assignment
        return employeeSalaryRepository.save(
                employeeSalary
        );
    }
}

