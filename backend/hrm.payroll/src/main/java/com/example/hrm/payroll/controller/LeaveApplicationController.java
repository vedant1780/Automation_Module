package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.LeaveApplication;
import com.example.hrm.payroll.entity.LeaveBalance;
import com.example.hrm.payroll.repository.EmployeeRepository;
import com.example.hrm.payroll.repository.LeaveApplicationRepository;
import com.example.hrm.payroll.repository.LeaveBalanceRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveApplicationController {

    private final LeaveApplicationRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    public LeaveApplicationController(
            LeaveApplicationRepository leaveRepository,
            EmployeeRepository employeeRepository,
            LeaveBalanceRepository leaveBalanceRepository) {

        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
    }

    // =========================================================
    // APPLY FOR LEAVE
    // =========================================================

    @PostMapping("/apply/{employeeId}")
    public LeaveApplication applyLeave(
            @PathVariable Long employeeId,
            @RequestBody LeaveApplication leave) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        // Validate dates
        if (leave.getStartDate() == null ||
                leave.getEndDate() == null) {

            throw new RuntimeException(
                    "Start date and end date are required");
        }

        if (leave.getEndDate().isBefore(
                leave.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date");
        }

        // Validate leave type
        if (leave.getLeaveType() == null ||
                (!leave.getLeaveType().equalsIgnoreCase("CL")
                        && !leave.getLeaveType().equalsIgnoreCase("SL")
                        && !leave.getLeaveType().equalsIgnoreCase("EL"))) {

            throw new RuntimeException(
                    "Invalid leave type. Use CL, SL or EL");
        }

        // Calculate number of days
        long days = ChronoUnit.DAYS.between(
                leave.getStartDate(),
                leave.getEndDate()
        ) + 1;

        leave.setEmployee(employee);
        leave.setNumberOfDays((int) days);
        leave.setStatus("PENDING");

        return leaveRepository.save(leave);
    }

    // =========================================================
    // GET ALL LEAVES
    // =========================================================

    @GetMapping
    public List<LeaveApplication> getAllLeaves() {
        return leaveRepository.findAll();
    }

    // =========================================================
    // GET EMPLOYEE LEAVES
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public List<LeaveApplication> getEmployeeLeaves(
            @PathVariable Long employeeId) {

        employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        return leaveRepository.findByEmployeeId(employeeId);
    }

    // =========================================================
    // APPROVE LEAVE
    // =========================================================

    @Transactional
    @PutMapping("/{leaveId}/approve")
    public LeaveApplication approveLeave(
            @PathVariable Long leaveId) {

        LeaveApplication leave =
                leaveRepository.findById(leaveId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Leave application not found"));

        // Only PENDING leave can be approved
        if (!"PENDING".equalsIgnoreCase(
                leave.getStatus())) {

            throw new RuntimeException(
                    "Only PENDING leave can be approved. Current status: "
                            + leave.getStatus());
        }

        // Validate leave type
        String leaveType =
                leave.getLeaveType().toUpperCase();

        int days = leave.getNumberOfDays();

        if (days <= 0) {
            throw new RuntimeException(
                    "Invalid number of leave days");
        }

        // Find leave balance
        LeaveBalance balance =
                leaveBalanceRepository
                        .findByEmployeeIdAndYear(
                                leave.getEmployee().getId(),
                                leave.getStartDate().getYear()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Leave balance not found for employee"));

        // =====================================================
        // DEDUCT LEAVE BALANCE
        // =====================================================

        switch (leaveType) {

            case "CL":

                if (balance.getCasualLeave() < days) {

                    throw new RuntimeException(
                            "Insufficient CL balance. Available: "
                                    + balance.getCasualLeave()
                                    + ", Required: "
                                    + days);
                }

                balance.setCasualLeave(
                        balance.getCasualLeave() - days
                );

                break;


            case "SL":

                if (balance.getSickLeave() < days) {

                    throw new RuntimeException(
                            "Insufficient SL balance. Available: "
                                    + balance.getSickLeave()
                                    + ", Required: "
                                    + days);
                }

                balance.setSickLeave(
                        balance.getSickLeave() - days
                );

                break;


            case "EL":

                if (balance.getEarnedLeave() < days) {

                    throw new RuntimeException(
                            "Insufficient EL balance. Available: "
                                    + balance.getEarnedLeave()
                                    + ", Required: "
                                    + days);
                }

                balance.setEarnedLeave(
                        balance.getEarnedLeave() - days
                );

                break;


            default:

                throw new RuntimeException(
                        "Invalid leave type. Use CL, SL or EL");
        }

        // Save updated balance
        leaveBalanceRepository.save(balance);

        // Change status
        leave.setStatus("APPROVED");

        return leaveRepository.save(leave);
    }

    // =========================================================
    // REJECT LEAVE
    // =========================================================

    @Transactional
    @PutMapping("/{leaveId}/reject")
    public LeaveApplication rejectLeave(
            @PathVariable Long leaveId) {

        LeaveApplication leave =
                leaveRepository.findById(leaveId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Leave application not found"));

        // Only PENDING leave can be rejected
        if (!"PENDING".equalsIgnoreCase(
                leave.getStatus())) {

            throw new RuntimeException(
                    "Only PENDING leave can be rejected. Current status: "
                            + leave.getStatus());
        }

        leave.setStatus("REJECTED");

        return leaveRepository.save(leave);
    }
}