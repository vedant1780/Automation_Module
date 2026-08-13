package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.*;
import com.example.hrm.payroll.repository.*;
import com.example.hrm.payroll.service.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryRepository employeeSalaryRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final PayslipPdfService payslipPdfService;
    private final PayslipEmailService payslipEmailService;
    private final PayslipEmailRepository payslipEmailRepository;
    private final PayrollService payrollService;
    private final PayrollGenerationService payrollGenerationService;
    private final ScheduledPayrollService scheduledPayrollService;

    public PayrollController(
            PayrollRepository payrollRepository,
            EmployeeRepository employeeRepository,
            EmployeeSalaryRepository employeeSalaryRepository,
            AttendanceRepository attendanceRepository,
            LeaveApplicationRepository leaveApplicationRepository,
            PayslipPdfService payslipPdfService,
            PayslipEmailService payslipEmailService,
            PayslipEmailRepository payslipEmailRepository,
            PayrollService payrollService,
            PayrollGenerationService payrollGenerationService,
            ScheduledPayrollService scheduledPayrollService

    ) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.employeeSalaryRepository = employeeSalaryRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveApplicationRepository = leaveApplicationRepository;
        this.payslipPdfService = payslipPdfService;
        this.payslipEmailService = payslipEmailService;
        this.payslipEmailRepository = payslipEmailRepository;
        this.payrollService = payrollService;
        this.payrollGenerationService = payrollGenerationService;
        this.scheduledPayrollService = scheduledPayrollService;
    }

    // ==========================================================
    // GENERATE PAYROLL
    // ==========================================================
    @PostMapping("/generate/{employeeId}")
    public Payroll generatePayroll(
            @PathVariable Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {

        Payroll payroll =
                payrollGenerationService.generatePayroll(
                        employeeId,
                        month,
                        year
                );

        // Generate PDF
        byte[] pdf =
                payslipPdfService.generatePayslip(
                        payroll
                );

        String fileName =
                "Payslip_"
                        + payroll.getEmployee()
                        .getEmployeeCode()
                        + "_"
                        + month
                        + "_"
                        + year
                        + ".pdf";

        try {

            java.nio.file.Path directory =
                    java.nio.file.Paths.get("payslips");

            java.nio.file.Files.createDirectories(
                    directory
            );

            java.nio.file.Path filePath =
                    directory.resolve(fileName);

            java.nio.file.Files.write(
                    filePath,
                    pdf
            );

            payroll.setPdfPath(
                    filePath.toString()
            );

            return payrollRepository.save(payroll);

        } catch (java.io.IOException e) {

            throw new RuntimeException(
                    "Failed to save payslip PDF",
                    e
            );
        }
    }



    // ==========================================================
    // SEND PAYSLIP EMAIL
    // ==========================================================

    @PostMapping("/{payrollId}/payslip/email")
    public ResponseEntity<?> emailPayslip(
            @PathVariable Long payrollId) {

        Payroll payroll =
                payrollRepository.findById(payrollId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payroll not found"));

        PayslipEmail log =
                payslipEmailService.sendPayslip(payroll);

        return ResponseEntity.ok(log);
    }

    // ==========================================================
    // GET ALL PAYROLLS
    // ==========================================================

    @GetMapping
    public List<Payroll> getAllPayrolls() {

        return payrollRepository.findAll();
    }

    // ==========================================================
    // GET PAYROLL BY ID
    // ==========================================================

    @GetMapping("/{payrollId}")
    public Payroll getPayrollById(
            @PathVariable Long payrollId) {

        return payrollRepository
                .findById(payrollId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payroll not found"));
    }

    // ==========================================================
    // VIEW PAYSLIP PDF
    // ==========================================================

    @GetMapping("/{payrollId}/payslip/view")
    public ResponseEntity<byte[]> viewPayslip(
            @PathVariable Long payrollId) {

        Payroll payroll =
                payrollRepository
                        .findById(payrollId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payroll not found"));

        if (payroll.getPdfPath() == null) {
            throw new RuntimeException(
                    "Payslip PDF not generated");
        }

        try {

            java.nio.file.Path path =
                    java.nio.file.Paths.get(
                            payroll.getPdfPath()
                    );

            if (!java.nio.file.Files.exists(path)) {
                throw new RuntimeException(
                        "Payslip PDF file not found");
            }

            byte[] pdf =
                    java.nio.file.Files.readAllBytes(path);

            return ResponseEntity.ok()
                    .header(
                            org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" +
                                    path.getFileName() +
                                    "\""
                    )
                    .contentType(
                            org.springframework.http.MediaType.APPLICATION_PDF
                    )
                    .body(pdf);

        } catch (java.io.IOException e) {

            throw new RuntimeException(
                    "Unable to read payslip PDF",
                    e
            );
        }
    }

    // ==========================================================
    // GET PAYROLLS BY EMPLOYEE
    // ==========================================================

    @GetMapping("/employee/{employeeId}")
    public List<Payroll> getEmployeePayrolls(
            @PathVariable Long employeeId) {

        employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found"));

        return payrollRepository
                .findByEmployeeId(employeeId);
    }

    // ==========================================================
    // GET PAYROLL BY EMPLOYEE + PERIOD
    // ==========================================================

    @GetMapping("/employee/{employeeId}/period")
    public Payroll getEmployeePayrollByPeriod(
            @PathVariable Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {

        employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found"));

        return payrollRepository
                .findByEmployeeIdAndMonthAndYear(
                        employeeId,
                        month,
                        year
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payroll not found for this period"
                        ));
    }

    // ==========================================================
    // REGENERATE PAYSLIP
    // ==========================================================

    @PostMapping("/{payrollId}/payslip/regenerate")
    public String regeneratePayslip(
            @PathVariable Long payrollId) {

        Payroll payroll =
                payrollRepository
                        .findById(payrollId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payroll not found"));

        try {

            byte[] pdf =
                    payslipPdfService.generatePayslip(
                            payroll
                    );

            java.nio.file.Path directory =
                    java.nio.file.Paths.get("payslips");

            java.nio.file.Files.createDirectories(
                    directory
            );

            String fileName =
                    "Payslip_"
                            + payroll.getEmployee()
                            .getEmployeeCode()
                            + "_"
                            + payroll.getMonth()
                            + "_"
                            + payroll.getYear()
                            + ".pdf";

            java.nio.file.Path filePath =
                    directory.resolve(fileName);

            java.nio.file.Files.write(
                    filePath,
                    pdf
            );

            payroll.setPdfPath(
                    filePath.toString()
            );

            payrollRepository.save(payroll);

            return "Payslip regenerated successfully";

        } catch (java.io.IOException e) {

            throw new RuntimeException(
                    "Failed to regenerate payslip",
                    e
            );
        }
    }

    // ==========================================================
    // DELETE PAYROLL
    // ==========================================================
    @DeleteMapping("/{payrollId}")
    public String deletePayroll(
            @PathVariable Long payrollId) {

        payrollService.deletePayroll(payrollId);

        return "Payroll deleted successfully";
    }
    @PostMapping("/schedule/run")
    public ResponseEntity<String> runScheduledPayroll() {

        scheduledPayrollService.generateAndDeliverPayroll();

        return ResponseEntity.ok(
                "Scheduled payroll process started successfully"
        );
    }

}
