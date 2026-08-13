package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.Attendance;
import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.repository.AttendanceRepository;
import com.example.hrm.payroll.repository.EmployeeRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceController(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/{employeeId}")
    public Attendance markAttendance(
            @PathVariable Long employeeId,
            @RequestBody Attendance attendance) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        attendance.setEmployee(employee);

        return attendanceRepository.save(attendance);
    }

    @GetMapping("/{employeeId}")
    public List<Attendance> getAttendance(
            @PathVariable Long employeeId) {

        return attendanceRepository
                .findAll()
                .stream()
                .filter(a ->
                        a.getEmployee().getId().equals(employeeId))
                .toList();
    }
}