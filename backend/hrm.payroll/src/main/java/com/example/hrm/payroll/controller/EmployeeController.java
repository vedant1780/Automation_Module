package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.LeaveBalance;

import com.example.hrm.payroll.repository.EmployeeRepository;
import com.example.hrm.payroll.repository.LeaveBalanceRepository;
import com.example.hrm.payroll.repository.EmployeeSalaryRepository;
import com.example.hrm.payroll.repository.LeaveApplicationRepository;
import com.example.hrm.payroll.repository.AttendanceRepository;
import com.example.hrm.payroll.repository.PayrollRepository;
import com.example.hrm.payroll.repository.PayslipEmailRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeSalaryRepository employeeSalaryRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayrollRepository payrollRepository;
    private final PayslipEmailRepository payslipEmailRepository;

    public EmployeeController(
            EmployeeRepository employeeRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            EmployeeSalaryRepository employeeSalaryRepository,
            LeaveApplicationRepository leaveApplicationRepository,
            AttendanceRepository attendanceRepository,
            PayrollRepository payrollRepository,
            PayslipEmailRepository payslipEmailRepository) {

        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeSalaryRepository = employeeSalaryRepository;
        this.leaveApplicationRepository = leaveApplicationRepository;
        this.attendanceRepository = attendanceRepository;
        this.payrollRepository = payrollRepository;
        this.payslipEmailRepository = payslipEmailRepository;
    }

    @PostMapping
    @Transactional
    public Employee createEmployee(
            @RequestBody Employee employee) {

        Employee savedEmployee =
                employeeRepository.save(employee);

        int currentYear =
                Year.now().getValue();

        LeaveBalance leaveBalance =
                new LeaveBalance();

        leaveBalance.setEmployee(savedEmployee);

        leaveBalance.setCasualLeave(12);
        leaveBalance.setSickLeave(10);
        leaveBalance.setEarnedLeave(15);

        leaveBalance.setYear(currentYear);

        leaveBalanceRepository.save(leaveBalance);

        return savedEmployee;
    }


    @GetMapping
    public List<Employee> getEmployees() {

        return employeeRepository.findAll();
    }


    @GetMapping("/{id}")
    public Employee getEmployee(
            @PathVariable Long id) {

        return employeeRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found"
                        ));
    }


    @PutMapping("/{id}")
    @Transactional
    public Employee updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee) {

        Employee existingEmployee =
                employeeRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                ));

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

        return employeeRepository.save(
                existingEmployee
        );
    }


    @DeleteMapping("/{id}")
    @Transactional
    public String deleteEmployee(
            @PathVariable Long id) {

        Employee employee =
                employeeRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                ));


        payslipEmailRepository
                .deleteByEmployeeId(id);


        payrollRepository
                .deleteByEmployeeId(id);


        employeeSalaryRepository
                .deleteByEmployeeId(id);


        leaveApplicationRepository
                .deleteByEmployeeId(id);


        attendanceRepository
                .deleteByEmployeeId(id);


        leaveBalanceRepository
                .findByEmployeeId(id)
                .ifPresent(
                        leaveBalanceRepository::delete
                );


        employeeRepository.delete(employee);


        return "Employee deleted successfully";
    }
}