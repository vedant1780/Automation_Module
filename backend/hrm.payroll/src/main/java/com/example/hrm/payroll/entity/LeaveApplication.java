package com.example.hrm.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Entity
@Table(name = "leave_applications")
public class LeaveApplication {
    @Column(nullable = false)
    private Boolean paidLeave = false;

    public void setPaidLeave(Boolean paidLeave) {
        this.paidLeave = paidLeave;
    }

    public void setPaidLeave(boolean paidLeave) {
        this.paidLeave = paidLeave;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private String leaveType;   // CL, SL, EL

    @Setter
    private LocalDate startDate;
    private LocalDate endDate;

    @Setter
    private int numberOfDays;

    private String reason;

    @Setter
    private String status;      // PENDING, APPROVED, REJECTED

    // Getters and Setters

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

}