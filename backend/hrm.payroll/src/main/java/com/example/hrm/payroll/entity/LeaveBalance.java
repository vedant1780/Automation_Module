package com.example.hrm.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "leave_balances",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"employee_id", "year"}
                )
        }
)
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(
            name = "employee_id",
            nullable = false
    )
    private Employee employee;

    private int casualLeave;

    private int sickLeave;

    private int earnedLeave;

    private int year;
}
