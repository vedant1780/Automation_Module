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

        this.employeeRepository = employeeRepository;
        this.payrollGenerationService = payrollGenerationService;
        this.payslipEmailService = payslipEmailService;
    }

    // ==========================================================
    // RUN ON 1ST DAY OF EVERY MONTH AT 9:00 AM
    // ==========================================================

    @Scheduled(
            cron = "0 0 9 1 * *",
            zone = "Asia/Kolkata"
    )
    public void generateAndDeliverPayroll() {

        System.out.println();
        System.out.println("================================================");
        System.out.println("SCHEDULED PAYROLL PROCESS STARTED");
        System.out.println("================================================");

        LocalDate today = LocalDate.now();

        // Previous month
        LocalDate previousMonth = today.minusMonths(1);

        int month = previousMonth.getMonthValue();
        int year = previousMonth.getYear();

        System.out.println(
                "Payroll Period: " + month + "/" + year
        );

        try {

            List<Employee> employees =
                    employeeRepository.findAll();

            System.out.println(
                    "Employees found: " + employees.size()
            );

            int successful = 0;
            int failed = 0;

            for (Employee employee : employees) {

                try {

                    processEmployee(
                            employee,
                            month,
                            year
                    );

                    successful++;

                } catch (Exception e) {

                    failed++;

                    String employeeCode =
                            employee.getEmployeeCode() != null
                                    ? employee.getEmployeeCode()
                                    : String.valueOf(employee.getId());

                    System.err.println(
                            "------------------------------------------------"
                    );

                    System.err.println(
                            "PAYROLL FAILED"
                    );

                    System.err.println(
                            "Employee: "
                                    + employee.getName()
                    );

                    System.err.println(
                            "Employee Code: "
                                    + employeeCode
                    );

                    System.err.println(
                            "Period: "
                                    + month
                                    + "/"
                                    + year
                    );

                    System.err.println(
                            "Reason: "
                                    + e.getMessage()
                    );

                    System.err.println(
                            "------------------------------------------------"
                    );

                    // Continue with next employee
                }
            }

            System.out.println();
            System.out.println(
                    "Successful payrolls: " + successful
            );

            System.out.println(
                    "Failed payrolls: " + failed
            );

        } catch (Exception e) {

            System.err.println(
                    "Scheduled payroll process failed: "
                            + e.getMessage()
            );

            e.printStackTrace();
        }

        System.out.println();
        System.out.println("================================================");
        System.out.println("SCHEDULED PAYROLL PROCESS COMPLETED");
        System.out.println("================================================");
        System.out.println();
    }

    // ==========================================================
    // PROCESS ONE EMPLOYEE
    // ==========================================================

    private void processEmployee(
            Employee employee,
            int month,
            int year) {

        System.out.println();
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

        if (payroll == null || payroll.getId() == null) {

            throw new RuntimeException(
                    "Payroll was not generated for employee "
                            + employee.getId()
            );
        }

        System.out.println(
                "Payroll generated successfully. Payroll ID: "
                        + payroll.getId()
        );

        // ------------------------------------------------------
        // 2. Generate PDF + Send Email
        // ------------------------------------------------------

        payslipEmailService.sendPayslip(payroll);

        System.out.println(
                "Payroll delivered successfully: "
                        + employee.getName()
        );
    }
}