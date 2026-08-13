package com.example.hrm.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Entity
@Table(name = "leave_balances")
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @OneToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Setter
    private int casualLeave;
    @Setter
    private int sickLeave;
    @Setter
    private int earnedLeave;

    private int year;

    public void setYear(int year) {
        this.year = year;
    }
}