package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.*;
import com.example.hrm.payroll.exception.InvalidPayrollPeriodException;
import com.example.hrm.payroll.exception.PayrollAlreadyProcessingException;
import com.example.hrm.payroll.exception.ResourceNotFoundException;
import com.example.hrm.payroll.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.DateTimeException;
import java.util.List;

@Service
public class PayrollGenerationService {

    // Statutory constants — extract to config/properties if these vary by state or change often.
    private static final BigDecimal PF_RATE = new BigDecimal("0.12");
    private static final BigDecimal ESI_RATE = new BigDecimal("0.0075");
    private static final BigDecimal ESI_GROSS_THRESHOLD = new BigDecimal("21000");
    private static final BigDecimal PROFESSIONAL_TAX = new BigDecimal("200.00");

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryRepository employeeSalaryRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final PayslipPdfService payslipPdfService;
    private final PayslipStorageService payslipStorageService;

    public PayrollGenerationService(
            PayrollRepository payrollRepository,
            EmployeeRepository employeeRepository,
            EmployeeSalaryRepository employeeSalaryRepository,
            AttendanceRepository attendanceRepository,
            LeaveApplicationRepository leaveApplicationRepository,
            PayslipPdfService payslipPdfService,
            PayslipStorageService payslipStorageService) {

        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.employeeSalaryRepository = employeeSalaryRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveApplicationRepository = leaveApplicationRepository;
        this.payslipPdfService = payslipPdfService;
        this.payslipStorageService = payslipStorageService;
    }

    @Transactional
    public Payroll generatePayroll(Long employeeId, int month, int year) {

        // 1. EMPLOYEE LOOKUP
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        // 2. PAY PERIOD VALIDATION
        YearMonth yearMonth;
        try {
            yearMonth = YearMonth.of(year, month);
        } catch (DateTimeException e) {
            throw new InvalidPayrollPeriodException("Invalid month (" + month + ") or year (" + year + ")");
        }

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        // 3. SALARY ASSIGNMENT LOOKUP
        EmployeeSalary employeeSalary = employeeSalaryRepository
                .findTopByEmployeeIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(employeeId, endDate)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Salary structure not assigned for " + yearMonth + " for employee ID: " + employeeId));

        // 4. CHECK EFFECTIVE DATES
        LocalDate effectiveFrom = employeeSalary.getEffectiveFrom();
        LocalDate effectiveTo = employeeSalary.getEffectiveTo();

        if (effectiveFrom != null && effectiveFrom.isAfter(endDate)) {
            throw new InvalidPayrollPeriodException("Salary structure starts after payroll period");
        }

        if (effectiveTo != null && effectiveTo.isBefore(startDate)) {
            throw new InvalidPayrollPeriodException("Salary structure expired before " + yearMonth);
        }

        // 5. GET SALARY STRUCTURE
        SalaryStructure salaryStructure = employeeSalary.getSalaryStructure();
        if (salaryStructure == null) {
            throw new ResourceNotFoundException("Salary structure null for employee ID: " + employeeId);
        }

        // 6. SALARY COMPONENTS (NULL-SAFE & EXACT SCALING)
        BigDecimal basic = safeScale(salaryStructure.getBasicSalary());
        BigDecimal hra = safeScale(salaryStructure.getHra());
        BigDecimal special = safeScale(salaryStructure.getSpecialAllowance());

        // 7. GROSS SALARY
        BigDecimal gross = basic.add(hra).add(special).setScale(2, RoundingMode.HALF_UP);

        // 8. ATTENDANCE FETCH
        List<Attendance> attendanceList = attendanceRepository
                .findByEmployeeIdAndAttendanceDateBetween(employeeId, startDate, endDate);

        // 9. APPROVED LEAVES FETCH
        List<LeaveApplication> approvedLeaves = leaveApplicationRepository
                .findByEmployeeIdAndStatus(employeeId, "APPROVED");

        // 10. COUNT ABSENT / HALF DAYS
        int absentDays = 0;
        int halfDays = 0;

        for (Attendance attendance : attendanceList) {
            LocalDate attendanceDate = attendance.getAttendanceDate();
            String attendanceStatus = attendance.getStatus();

            if (attendanceDate == null || attendanceStatus == null) {
                continue;
            }

            boolean isApprovedLeave = approvedLeaves.stream().anyMatch(leave -> {
                if (leave.getStartDate() == null || leave.getEndDate() == null) {
                    return false;
                }
                return !attendanceDate.isBefore(leave.getStartDate())
                        && !attendanceDate.isAfter(leave.getEndDate());
            });

            if (isApprovedLeave) {
                continue;
            }

            if ("ABSENT".equalsIgnoreCase(attendanceStatus)) {
                absentDays++;
            } else if ("HALF_DAY".equalsIgnoreCase(attendanceStatus)) {
                halfDays++;
            }
        }

        // 11. LOP DEDUCTION
        int daysInMonth = yearMonth.lengthOfMonth();
        BigDecimal dailySalary = gross.divide(BigDecimal.valueOf(daysInMonth), 4, RoundingMode.HALF_UP);

        BigDecimal absentDeduction = dailySalary.multiply(BigDecimal.valueOf(absentDays));
        BigDecimal halfDayDeduction = dailySalary
                .multiply(BigDecimal.valueOf(halfDays))
                .divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP);

        BigDecimal lopDeduction = absentDeduction.add(halfDayDeduction).setScale(2, RoundingMode.HALF_UP);

        // 12. PF DEDUCTION
        BigDecimal pf = basic.multiply(PF_RATE).setScale(2, RoundingMode.HALF_UP);

        // 13. ESI DEDUCTION
        BigDecimal esi = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (gross.compareTo(ESI_GROSS_THRESHOLD) <= 0) {
            esi = gross.multiply(ESI_RATE).setScale(2, RoundingMode.HALF_UP);
        }

        // 14. PROFESSIONAL TAX
        BigDecimal professionalTax = PROFESSIONAL_TAX;

        // 15. TOTAL DEDUCTIONS
        BigDecimal totalDeductions = lopDeduction.add(pf).add(esi).add(professionalTax)
                .setScale(2, RoundingMode.HALF_UP);

        // 16. NET SALARY
        BigDecimal netSalary = gross.subtract(totalDeductions).setScale(2, RoundingMode.HALF_UP);

        // Guard against absurd LOP (e.g. bad attendance data) producing a negative payout.
        // Adjust to your org's policy if this should behave differently.
        if (netSalary.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidPayrollPeriodException(
                    "Computed net salary is negative for employee " + employeeId + " in " + yearMonth
                            + " — check attendance data before proceeding");
        }

        // 17. FIND OR CREATE PAYROLL RECORD
        Payroll payroll = payrollRepository
                .findByEmployeeIdAndMonthAndYear(employeeId, month, year)
                .orElseGet(Payroll::new);

        // 18. SET PAYROLL DATA
        payroll.setEmployee(employee);
        payroll.setMonth(month);
        payroll.setYear(year);

        payroll.setBasicSalary(basic);
        payroll.setHra(hra);
        payroll.setSpecialAllowance(special);
        payroll.setGrossSalary(gross);

        payroll.setDeductions(lopDeduction); // LOP / attendance deductions specific column
        payroll.setPf(pf);
        payroll.setEsi(esi);
        payroll.setProfessionalTax(professionalTax);
        payroll.setTotalDeductions(totalDeductions);
        payroll.setNetSalary(netSalary);

        // 19. SAVE (guard against concurrent generation for the same period)
        Payroll savedPayroll;
        try {
            savedPayroll = payrollRepository.save(payroll);
        } catch (DataIntegrityViolationException e) {
            throw new PayrollAlreadyProcessingException(
                    "Payroll for employee " + employeeId + " in " + yearMonth
                            + " is already being generated or exists");
        }

        // 20. GENERATE + STORE PAYSLIP PDF
        // Runs after the payroll has an ID and finalized computed values.
        // Because this method is @Transactional, a failure here rolls back
        // the payroll save too — we never persist a payroll with a stale
        // or missing pdfPath.
        byte[] pdfBytes = payslipPdfService.generatePayslip(savedPayroll);
        String pdfPath = payslipStorageService.store(savedPayroll, pdfBytes);
        savedPayroll.setPdfPath(pdfPath);

        return payrollRepository.save(savedPayroll);
    }

    private BigDecimal safeScale(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}