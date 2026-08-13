package com.example.hrm.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(unique = true, nullable = false)
    private String employeeCode;

    @Setter
    @Column(nullable = false)
    private String name;

    @Setter
    @Column(unique = true, nullable = false)
    private String email;

    @Setter
    private String department;

    @Setter
    private String designation;
    @Setter
    @Column(unique = true, nullable = false)
    private String password;
    @Setter
    @Column(unique = true, nullable = false)
    private String role;

}