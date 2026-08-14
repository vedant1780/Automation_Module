package com.example.hrm.payroll.dto;



import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LeaveBalanceResponse {

    private Long employeeId;

    private int year;

    private int casualLeaveTotal;
    private int casualLeaveUsed;
    private int casualLeaveRemaining;

    private int sickLeaveTotal;
    private int sickLeaveUsed;
    private int sickLeaveRemaining;

    private int earnedLeaveTotal;
    private int earnedLeaveUsed;
    private int earnedLeaveRemaining;
}