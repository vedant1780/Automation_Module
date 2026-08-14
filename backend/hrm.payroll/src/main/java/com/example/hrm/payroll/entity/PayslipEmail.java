package com.example.hrm.payroll.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "payslip_emails")
public class PayslipEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "payslip_id")
    private Payroll payroll;

    @Setter
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Setter
    private String email;

    @Setter
    private String status;

    @Setter
    private LocalDateTime sentAt;

    @Setter
    @Column(length = 1000)
    private String errorMessage;


}