package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.LeaveApplication;
import com.example.hrm.payroll.entity.LeaveBalance;
import com.example.hrm.payroll.repository.EmployeeRepository;
import com.example.hrm.payroll.repository.LeaveApplicationRepository;
import com.example.hrm.payroll.repository.LeaveBalanceRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Year;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:5173")
public class LeaveBalanceController {

    private final EmployeeRepository employeeRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;


    public LeaveBalanceController(
            EmployeeRepository employeeRepository,
            LeaveApplicationRepository leaveApplicationRepository,
            LeaveBalanceRepository leaveBalanceRepository) {

        this.employeeRepository = employeeRepository;
        this.leaveApplicationRepository =
                leaveApplicationRepository;
        this.leaveBalanceRepository =
                leaveBalanceRepository;
    }


    // ==========================================================
    // GET EMPLOYEE LEAVE BALANCE
    // ==========================================================

    @GetMapping("/employee/{employeeId}/balance")
    public ResponseEntity<?> getLeaveBalance(
            @PathVariable Long employeeId) {


        // ------------------------------------------------------
        // Find employee
        // ------------------------------------------------------

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                        );


        int currentYear =
                Year.now().getValue();


        // ------------------------------------------------------
        // Find balance
        // ------------------------------------------------------

        LeaveBalance leaveBalance =
                leaveBalanceRepository
                        .findByEmployeeIdAndYear(
                                employeeId,
                                currentYear
                        )
                        .orElseGet(() -> {

                            // ----------------------------------
                            // Automatically create balance
                            // ----------------------------------

                            LeaveBalance newBalance =
                                    new LeaveBalance();

                            newBalance.setEmployee(
                                    employee
                            );

                            newBalance.setCasualLeave(
                                    12
                            );

                            newBalance.setSickLeave(
                                    10
                            );

                            newBalance.setEarnedLeave(
                                    15
                            );

                            newBalance.setYear(
                                    currentYear
                            );

                            return leaveBalanceRepository.save(
                                    newBalance
                            );
                        });


        // ------------------------------------------------------
        // Get approved leaves
        // ------------------------------------------------------

        List<LeaveApplication> leaves =
                leaveApplicationRepository
                        .findByEmployeeIdAndStatus(
                                employeeId,
                                "APPROVED"
                        );


        // ------------------------------------------------------
        // Calculate used leaves
        // ------------------------------------------------------

        int casualLeaveUsed = 0;
        int sickLeaveUsed = 0;
        int earnedLeaveUsed = 0;


        for (LeaveApplication leave : leaves) {

            if (leave.getStartDate() == null ||
                    leave.getEndDate() == null) {

                continue;
            }


            // Only current year
            if (leave.getStartDate().getYear()
                    != currentYear) {

                continue;
            }


            int days =
                    calculateLeaveDays(
                            leave.getStartDate(),
                            leave.getEndDate()
                    );


            if ("CL".equalsIgnoreCase(
                    leave.getLeaveType())) {

                casualLeaveUsed += days;

            } else if ("SL".equalsIgnoreCase(
                    leave.getLeaveType())) {

                sickLeaveUsed += days;

            } else if ("EL".equalsIgnoreCase(
                    leave.getLeaveType())) {

                earnedLeaveUsed += days;
            }
        }


        // ------------------------------------------------------
        // Remaining balance
        // ------------------------------------------------------

        int casualLeaveRemaining =
                Math.max(
                        leaveBalance.getCasualLeave()
                                - casualLeaveUsed,
                        0
                );


        int sickLeaveRemaining =
                Math.max(
                        leaveBalance.getSickLeave()
                                - sickLeaveUsed,
                        0
                );


        int earnedLeaveRemaining =
                Math.max(
                        leaveBalance.getEarnedLeave()
                                - earnedLeaveUsed,
                        0
                );


        // ------------------------------------------------------
        // Response
        // ------------------------------------------------------

        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "employeeId",
                employeeId
        );

        response.put(
                "employeeName",
                employee.getName()
        );

        response.put(
                "year",
                currentYear
        );


        // ------------------------------------------------------
        // Casual Leave
        // ------------------------------------------------------

        response.put(
                "casualLeaveTotal",
                leaveBalance.getCasualLeave()
        );

        response.put(
                "casualLeaveUsed",
                casualLeaveUsed
        );

        response.put(
                "casualLeaveRemaining",
                casualLeaveRemaining
        );


        // ------------------------------------------------------
        // Sick Leave
        // ------------------------------------------------------

        response.put(
                "sickLeaveTotal",
                leaveBalance.getSickLeave()
        );

        response.put(
                "sickLeaveUsed",
                sickLeaveUsed
        );

        response.put(
                "sickLeaveRemaining",
                sickLeaveRemaining
        );


        // ------------------------------------------------------
        // Earned Leave
        // ------------------------------------------------------

        response.put(
                "earnedLeaveTotal",
                leaveBalance.getEarnedLeave()
        );

        response.put(
                "earnedLeaveUsed",
                earnedLeaveUsed
        );

        response.put(
                "earnedLeaveRemaining",
                earnedLeaveRemaining
        );


        return ResponseEntity.ok(response);
    }


    // ==========================================================
    // CALCULATE LEAVE DAYS
    // ==========================================================

    private int calculateLeaveDays(
            LocalDate startDate,
            LocalDate endDate) {

        return (int)
                (
                        endDate.toEpochDay()
                                - startDate.toEpochDay()
                ) + 1;
    }
}
