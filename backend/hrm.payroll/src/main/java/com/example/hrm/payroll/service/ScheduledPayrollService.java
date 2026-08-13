package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.Payroll;
import com.example.hrm.payroll.repository.EmployeeRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ScheduledPayrollService {

    private final EmployeeRepository employeeRepository;
    private final PayrollGenerationService payrollGenerationService;
    private final PayslipEmailService payslipEmailService;

    public ScheduledPayrollService(
            EmployeeRepository employeeRepository,
            PayrollGenerationService payrollGenerationService,
            PayslipEmailService payslipEmailService) {

        this.employeeRepository =
                employeeRepository;

        this.payrollGenerationService =
                payrollGenerationService;

        this.payslipEmailService =
                payslipEmailService;
    }

    // ==========================================================
    // RUN ON 1ST DAY OF EVERY MONTH AT 9:00 AM
    // ==========================================================

    @Scheduled( cron = "0 0 9 1 * *", zone = "Asia/Kolkata" )
    public void generateAndDeliverPayroll() {

        System.out.println(
                "================================================"
        );

        System.out.println(
                "SCHEDULED PAYROLL PROCESS STARTED"
        );

        System.out.println(
                "================================================"
        );

        LocalDate today =
                LocalDate.now();

        // Previous month
        LocalDate previousMonth =
                today.minusMonths(1);

        int month =
                previousMonth.getMonthValue();

        int year =
                previousMonth.getYear();

        System.out.println(
                "Payroll Period: "
                        + month
                        + "/"
                        + year
        );

        try {

            List<Employee> employees =
                    employeeRepository.findAll();

            System.out.println(
                    "Employees found: "
                            + employees.size()
            );

            for (Employee employee : employees) {

                try {

                    processEmployee(
                            employee,
                            month,
                            year
                    );

                } catch (Exception e) {

                    System.err.println(
                            "Payroll failed for employee "
                                    + employee.getEmployeeCode()
                                    + ": "
                                    + e.getMessage()
                    );

                    // Continue processing
                    // remaining employees
                }
            }

        } catch (Exception e) {

            System.err.println(
                    "Scheduled payroll process failed: "
                            + e.getMessage()
            );
        }

        System.out.println(
                "================================================"
        );

        System.out.println(
                "SCHEDULED PAYROLL PROCESS COMPLETED"
        );

        System.out.println(
                "================================================"
        );
    }

    // ==========================================================
    // PROCESS ONE EMPLOYEE
    // ==========================================================

    private void processEmployee(
            Employee employee,
            int month,
            int year) {

        System.out.println(
                "Processing employee: "
                        + employee.getName()
        );

        // ------------------------------------------------------
        // 1. Generate payroll
        // ------------------------------------------------------

        Payroll payroll =
                payrollGenerationService.generatePayroll(
                        employee.getId(),
                        month,
                        year
                );

        // ------------------------------------------------------
        // 2. Generate PDF + Send Email
        // ------------------------------------------------------

        payslipEmailService.sendPayslip(
                payroll
        );

        System.out.println(
                "Payroll delivered successfully: "
                        + employee.getName()
        );
    }
}

