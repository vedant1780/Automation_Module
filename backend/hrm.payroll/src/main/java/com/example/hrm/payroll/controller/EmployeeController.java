package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.LeaveBalance;
import com.example.hrm.payroll.repository.EmployeeRepository;
import com.example.hrm.payroll.repository.LeaveBalanceRepository;

import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    public EmployeeController(
            EmployeeRepository employeeRepository,
            LeaveBalanceRepository leaveBalanceRepository) {

        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
    }


    // ==========================================================
    // CREATE EMPLOYEE
    // ==========================================================

    @PostMapping
    public Employee createEmployee(
            @RequestBody Employee employee) {

        // ------------------------------------------
        // Save employee first
        // ------------------------------------------

        Employee savedEmployee =
                employeeRepository.save(employee);


        // ------------------------------------------
        // Create leave balance automatically
        // ------------------------------------------

        int currentYear =
                Year.now().getValue();


        LeaveBalance leaveBalance =
                new LeaveBalance();

        leaveBalance.setEmployee(savedEmployee);

        // Default annual leave
        leaveBalance.setCasualLeave(12);
        leaveBalance.setSickLeave(10);
        leaveBalance.setEarnedLeave(15);

        leaveBalance.setYear(currentYear);


        leaveBalanceRepository.save(
                leaveBalance
        );


        return savedEmployee;
    }


    // ==========================================================
    // GET EMPLOYEES
    // ==========================================================

    @GetMapping
    public List<Employee> getEmployees() {

        return employeeRepository.findAll();
    }


    // ==========================================================
    // UPDATE EMPLOYEE
    // ==========================================================

    @PutMapping("/{id}")
    public Employee updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee) {

        Employee existingEmployee =
                employeeRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                        );


        existingEmployee.setEmployeeCode(
                employee.getEmployeeCode()
        );

        existingEmployee.setName(
                employee.getName()
        );

        existingEmployee.setEmail(
                employee.getEmail()
        );

        existingEmployee.setDepartment(
                employee.getDepartment()
        );

        existingEmployee.setDesignation(
                employee.getDesignation()
        );

        // Password and role intentionally unchanged
        // existingEmployee.setPassword(employee.getPassword());
        // existingEmployee.setRole(employee.getRole());


        return employeeRepository.save(
                existingEmployee
        );
    }


    // ==========================================================
    // DELETE EMPLOYEE
    // ==========================================================

    @DeleteMapping("/{id}")
    public String deleteEmployee(
            @PathVariable Long id) {

        if (!employeeRepository.existsById(id)) {

            return "Employee not found";
        }


        // Delete leave balance first
        leaveBalanceRepository
                .findByEmployeeId(id)
                .ifPresent(
                        leaveBalanceRepository::delete
                );


        employeeRepository.deleteById(id);


        return "Employee deleted successfully";
    }
}

