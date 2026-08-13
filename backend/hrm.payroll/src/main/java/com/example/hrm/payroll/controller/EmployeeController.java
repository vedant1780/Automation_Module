package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.repository.EmployeeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    public EmployeeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeRepository.save(employee);
    }

    @GetMapping
    public List<Employee> getEmployees() {
        return employeeRepository.findAll();
    }
    @DeleteMapping("/{id}")
    public String deleteEmployee(@PathVariable Long id)
    {
        if (!employeeRepository.existsById(id)) {
            return "Employee not found";
        }
        employeeRepository.deleteById(id);
        return "Employee deleted successfully";
    }
    @PutMapping("/{id}")
    public Employee updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee) {

        Employee existingEmployee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        existingEmployee.setEmployeeCode(employee.getEmployeeCode());
        existingEmployee.setName(employee.getName());
        existingEmployee.setEmail(employee.getEmail());
        existingEmployee.setDepartment(employee.getDepartment());
        existingEmployee.setDesignation(employee.getDesignation());
//        existingEmployee.setPassword(employee.getPassword());
//        existingEmployee.setRole(employee.getRole());

        return employeeRepository.save(existingEmployee);
    }
}