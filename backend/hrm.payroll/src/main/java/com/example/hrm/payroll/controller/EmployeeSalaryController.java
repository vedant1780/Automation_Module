package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.EmployeeSalary;
import com.example.hrm.payroll.entity.SalaryStructure;
import com.example.hrm.payroll.repository.EmployeeRepository;
import com.example.hrm.payroll.repository.EmployeeSalaryRepository;
import com.example.hrm.payroll.repository.SalaryStructureRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/employee-salary")
@CrossOrigin(origins = "http://localhost:5173")
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


    @GetMapping
    public ResponseEntity<List<EmployeeSalary>>
    getAllEmployeeSalaries() {

        List<EmployeeSalary> salaries =
                employeeSalaryRepository.findAll();

        return ResponseEntity.ok(salaries);
    }


    @GetMapping("/{id}")
    public ResponseEntity<EmployeeSalary>
    getEmployeeSalaryById(
            @PathVariable Long id) {

        EmployeeSalary employeeSalary =
                employeeSalaryRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee salary assignment not found with ID: "
                                                + id
                                ));

        return ResponseEntity.ok(employeeSalary);
    }


    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeSalary>>
    getSalaryHistory(
            @PathVariable Long employeeId) {

        employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with ID: "
                                        + employeeId
                        ));

        List<EmployeeSalary> salaries =
                employeeSalaryRepository
                        .findByEmployeeIdOrderByEffectiveFromDesc(
                                employeeId
                        );

        return ResponseEntity.ok(salaries);
    }


    @GetMapping("/employee/{employeeId}/latest")
    public ResponseEntity<EmployeeSalary>
    getLatestSalary(
            @PathVariable Long employeeId) {

        employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with ID: "
                                        + employeeId
                        ));

        EmployeeSalary salary =
                employeeSalaryRepository
                        .findFirstByEmployeeIdOrderByEffectiveFromDesc(
                                employeeId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary assignment not found for employee ID: "
                                                + employeeId
                                ));

        return ResponseEntity.ok(salary);
    }


    @PostMapping("/{employeeId}/{salaryStructureId}")
    public ResponseEntity<EmployeeSalary>
    assignSalary(
            @PathVariable Long employeeId,
            @PathVariable Long salaryStructureId,
            @RequestParam LocalDate effectiveFrom) {

        Employee employee =
                employeeRepository
                        .findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found with ID: "
                                                + employeeId
                                ));


        SalaryStructure salaryStructure =
                salaryStructureRepository
                        .findById(salaryStructureId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found with ID: "
                                                + salaryStructureId
                                ));


        if (effectiveFrom == null) {

            throw new RuntimeException(
                    "Effective from date is required"
            );
        }


        EmployeeSalary employeeSalary =
                new EmployeeSalary();

        employeeSalary.setEmployee(employee);

        employeeSalary.setSalaryStructure(
                salaryStructure
        );

        employeeSalary.setEffectiveFrom(
                effectiveFrom
        );

        employeeSalary.setEffectiveTo(null);


        EmployeeSalary savedSalary =
                employeeSalaryRepository.save(
                        employeeSalary
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedSalary);
    }


    @PutMapping("/{id}")
    public ResponseEntity<EmployeeSalary>
    updateSalary(
            @PathVariable Long id,
            @RequestParam(required = false)
            Long employeeId,
            @RequestParam(required = false)
            Long salaryStructureId,
            @RequestParam(required = false)
            LocalDate effectiveFrom,
            @RequestParam(required = false)
            LocalDate effectiveTo) {

        EmployeeSalary employeeSalary =
                employeeSalaryRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee salary assignment not found with ID: "
                                                + id
                                ));


        if (employeeId != null) {

            Employee employee =
                    employeeRepository
                            .findById(employeeId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Employee not found with ID: "
                                                    + employeeId
                                    ));

            employeeSalary.setEmployee(employee);
        }


        if (salaryStructureId != null) {

            SalaryStructure salaryStructure =
                    salaryStructureRepository
                            .findById(salaryStructureId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Salary structure not found with ID: "
                                                    + salaryStructureId
                                    ));

            employeeSalary.setSalaryStructure(
                    salaryStructure
            );
        }


        if (effectiveFrom != null) {

            employeeSalary.setEffectiveFrom(
                    effectiveFrom
            );
        }


        if (effectiveTo != null) {

            employeeSalary.setEffectiveTo(
                    effectiveTo
            );
        }


        if (employeeSalary.getEffectiveFrom() != null
                && employeeSalary.getEffectiveTo() != null
                && employeeSalary.getEffectiveTo()
                .isBefore(
                        employeeSalary.getEffectiveFrom()
                )) {

            throw new RuntimeException(
                    "Effective to date cannot be before effective from date"
            );
        }


        EmployeeSalary updatedSalary =
                employeeSalaryRepository.save(
                        employeeSalary
                );

        return ResponseEntity.ok(updatedSalary);
    }


    @PutMapping("/{id}/close")
    public ResponseEntity<EmployeeSalary>
    closeSalaryAssignment(
            @PathVariable Long id,
            @RequestParam LocalDate effectiveTo) {

        EmployeeSalary employeeSalary =
                employeeSalaryRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee salary assignment not found with ID: "
                                                + id
                                ));


        if (employeeSalary.getEffectiveFrom() != null
                && effectiveTo.isBefore(
                employeeSalary.getEffectiveFrom()
        )) {

            throw new RuntimeException(
                    "Effective to date cannot be before effective from date"
            );
        }


        employeeSalary.setEffectiveTo(
                effectiveTo
        );


        EmployeeSalary updatedSalary =
                employeeSalaryRepository.save(
                        employeeSalary
                );

        return ResponseEntity.ok(updatedSalary);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteSalaryAssignment(
            @PathVariable Long id) {

        EmployeeSalary employeeSalary =
                employeeSalaryRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee salary assignment not found with ID: "
                                                + id
                                ));


        employeeSalaryRepository.delete(
                employeeSalary
        );


        return ResponseEntity.ok(
                "Employee salary assignment deleted successfully"
        );
    }
}
