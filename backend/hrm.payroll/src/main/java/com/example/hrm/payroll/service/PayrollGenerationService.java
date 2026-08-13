package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.Attendance;
import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.EmployeeSalary;
import com.example.hrm.payroll.entity.LeaveApplication;
import com.example.hrm.payroll.entity.Payroll;
import com.example.hrm.payroll.entity.SalaryStructure;
import com.example.hrm.payroll.repository.AttendanceRepository;
import com.example.hrm.payroll.repository.EmployeeRepository;
import com.example.hrm.payroll.repository.EmployeeSalaryRepository;
import com.example.hrm.payroll.repository.LeaveApplicationRepository;
import com.example.hrm.payroll.repository.PayrollRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class PayrollGenerationService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryRepository employeeSalaryRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;

    public PayrollGenerationService(
            PayrollRepository payrollRepository,
            EmployeeRepository employeeRepository,
            EmployeeSalaryRepository employeeSalaryRepository,
            AttendanceRepository attendanceRepository,
            LeaveApplicationRepository leaveApplicationRepository) {

        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.employeeSalaryRepository = employeeSalaryRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveApplicationRepository = leaveApplicationRepository;
    }

    @Transactional
    public Payroll generatePayroll(
            Long employeeId,
            int month,
            int year) {

        // ======================================================
        // EMPLOYEE
        // ======================================================

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"));

        // ======================================================
        // PAY PERIOD
        // ======================================================

        YearMonth yearMonth;

        try {

            yearMonth =
                    YearMonth.of(year, month);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid month/year");
        }

        LocalDate startDate =
                yearMonth.atDay(1);

        LocalDate endDate =
                yearMonth.atEndOfMonth();

        // ======================================================
        // SALARY STRUCTURE
        // ======================================================

        EmployeeSalary employeeSalary =
                employeeSalaryRepository
                        .findTopByEmployeeIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
                                employeeId,
                                endDate
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not assigned for this period"
                                ));

        SalaryStructure salaryStructure =
                employeeSalary.getSalaryStructure();

        if (salaryStructure == null) {

            throw new RuntimeException(
                    "Salary structure not found");
        }

        // ======================================================
        // SALARY COMPONENTS
        // ======================================================

        BigDecimal basic =
                salaryStructure.getBasicSalary();

        BigDecimal hra =
                salaryStructure.getHra();

        BigDecimal special =
                salaryStructure.getSpecialAllowance();

        if (basic == null) {
            basic = BigDecimal.ZERO;
        }

        if (hra == null) {
            hra = BigDecimal.ZERO;
        }

        if (special == null) {
            special = BigDecimal.ZERO;
        }

        basic =
                basic.setScale(
                        2,
                        RoundingMode.HALF_UP);

        hra =
                hra.setScale(
                        2,
                        RoundingMode.HALF_UP);

        special =
                special.setScale(
                        2,
                        RoundingMode.HALF_UP);

        // ======================================================
        // GROSS SALARY
        // ======================================================

        BigDecimal gross =
                basic
                        .add(hra)
                        .add(special)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP);

        // ======================================================
        // ATTENDANCE
        // ======================================================

        List<Attendance> attendanceList =
                attendanceRepository
                        .findByEmployeeIdAndAttendanceDateBetween(
                                employeeId,
                                startDate,
                                endDate
                        );

        // ======================================================
        // APPROVED LEAVES
        // ======================================================

        List<LeaveApplication> approvedLeaves =
                leaveApplicationRepository
                        .findByEmployeeIdAndStatus(
                                employeeId,
                                "APPROVED"
                        );

        // ======================================================
        // COUNT ABSENT / HALF DAYS
        // ======================================================

        int absentDays = 0;
        int halfDays = 0;

        for (Attendance attendance :
                attendanceList) {

            LocalDate attendanceDate =
                    attendance.getAttendanceDate();

            String attendanceStatus =
                    attendance.getStatus();

            if (attendanceDate == null ||
                    attendanceStatus == null) {

                continue;
            }

            boolean isApprovedLeave =
                    approvedLeaves.stream()
                            .anyMatch(leave -> {

                                if (leave.getStartDate() == null ||
                                        leave.getEndDate() == null) {

                                    return false;
                                }

                                return !attendanceDate.isBefore(
                                        leave.getStartDate())
                                        &&
                                        !attendanceDate.isAfter(
                                                leave.getEndDate());
                            });

            // Approved leave is paid leave
            if (isApprovedLeave) {
                continue;
            }

            if ("ABSENT".equalsIgnoreCase(
                    attendanceStatus)) {

                absentDays++;

            } else if ("HALF_DAY".equalsIgnoreCase(
                    attendanceStatus)) {

                halfDays++;
            }
        }

        // ======================================================
        // LOP DEDUCTION
        // ======================================================

        int daysInMonth =
                yearMonth.lengthOfMonth();

        BigDecimal dailySalary =
                gross.divide(
                        BigDecimal.valueOf(daysInMonth),
                        2,
                        RoundingMode.HALF_UP
                );

        BigDecimal absentDeduction =
                dailySalary.multiply(
                        BigDecimal.valueOf(absentDays)
                );

        BigDecimal halfDayDeduction =
                dailySalary
                        .multiply(
                                BigDecimal.valueOf(halfDays)
                        )
                        .divide(
                                BigDecimal.valueOf(2),
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal lopDeduction =
                absentDeduction
                        .add(halfDayDeduction)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        // ======================================================
        // PF
        // ======================================================

        BigDecimal pf =
                basic
                        .multiply(
                                new BigDecimal("0.12")
                        )
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        // ======================================================
        // ESI
        // ======================================================

        BigDecimal esi =
                BigDecimal.ZERO;

        if (gross.compareTo(
                new BigDecimal("21000")) <= 0) {

            esi =
                    gross
                            .multiply(
                                    new BigDecimal("0.0075")
                            )
                            .setScale(
                                    2,
                                    RoundingMode.HALF_UP
                            );
        }

        // ======================================================
        // PROFESSIONAL TAX
        // ======================================================

        BigDecimal professionalTax =
                new BigDecimal("200.00");

        // ======================================================
        // TOTAL DEDUCTIONS
        // ======================================================

        BigDecimal totalDeductions =
                lopDeduction
                        .add(pf)
                        .add(esi)
                        .add(professionalTax)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        // ======================================================
        // NET SALARY
        // ======================================================

        BigDecimal netSalary =
                gross
                        .subtract(totalDeductions)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        // ======================================================
        // FIND EXISTING PAYROLL
        // ======================================================

        Payroll payroll =
                payrollRepository
                        .findByEmployeeIdAndMonthAndYear(
                                employeeId,
                                month,
                                year
                        )
                        .orElse(new Payroll());

        // ======================================================
        // SET PAYROLL DATA
        // ======================================================

        payroll.setEmployee(employee);

        payroll.setMonth(month);

        payroll.setYear(year);

        payroll.setBasicSalary(basic);

        payroll.setHra(hra);

        payroll.setSpecialAllowance(special);

        payroll.setGrossSalary(gross);

        payroll.setDeductions(lopDeduction);

        payroll.setPf(pf);

        payroll.setEsi(esi);

        payroll.setProfessionalTax(
                professionalTax);

        payroll.setTotalDeductions(
                totalDeductions);

        payroll.setNetSalary(netSalary);

        // ======================================================
        // SAVE PAYROLL
        // ======================================================

        return payrollRepository.save(payroll);
    }
}
