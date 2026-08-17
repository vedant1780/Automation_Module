package com.example.hrm.payroll.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "payslip_email",
        indexes = {
                @Index(name = "idx_payslip_email_employee_id", columnList = "employee_id"),
                @Index(name = "idx_payslip_email_payroll_id", columnList = "payroll_id"),
                @Index(name = "idx_payslip_email_status", columnList = "status")
        }
)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PayslipEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payroll_id", nullable = false)
    private Payroll payroll;

    // Denormalized for query convenience — must always match payroll.getEmployee().getId().
    // Set via the service layer from `payroll`, never independently.
    @Column(name = "employee_id", nullable = false, updatable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PayslipEmailStatus status;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Version
    private Long version;
}