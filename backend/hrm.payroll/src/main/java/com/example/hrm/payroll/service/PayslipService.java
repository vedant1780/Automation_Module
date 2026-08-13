package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.Payroll;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class PayslipService {

    public byte[] generatePayslip(Payroll payroll) {

        try {

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            Document document =
                    new Document(PageSize.A4, 36, 36, 36, 36);

            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.open();

            // ==========================================
            // FONTS
            // ==========================================

            Font companyFont =
                    new Font(
                            Font.HELVETICA,
                            20,
                            Font.BOLD
                    );

            Font titleFont =
                    new Font(
                            Font.HELVETICA,
                            14,
                            Font.BOLD
                    );

            Font sectionFont =
                    new Font(
                            Font.HELVETICA,
                            11,
                            Font.BOLD
                    );

            Font normalFont =
                    new Font(
                            Font.HELVETICA,
                            10
                    );

            Font boldFont =
                    new Font(
                            Font.HELVETICA,
                            10,
                            Font.BOLD
                    );

            Font netFont =
                    new Font(
                            Font.HELVETICA,
                            14,
                            Font.BOLD
                    );


            // ==========================================
            // COMPANY HEADER
            // ==========================================

            Paragraph company =
                    new Paragraph(
                            "HRM PAYROLL",
                            companyFont
                    );

            company.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(company);

            Paragraph payslip =
                    new Paragraph(
                            "SALARY PAYSLIP",
                            titleFont
                    );

            payslip.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(payslip);

            document.add(
                    new Paragraph(" ")
            );


            // ==========================================
            // MONTH
            // ==========================================

            String monthName =
                    java.time.Month
                            .of(payroll.getMonth())
                            .name();

            monthName =
                    monthName.substring(0, 1)
                            + monthName
                            .substring(1)
                            .toLowerCase();

            Paragraph salaryMonth =
                    new Paragraph(
                            monthName
                                    + " "
                                    + payroll.getYear(),
                            boldFont
                    );

            salaryMonth.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(salaryMonth);

            document.add(
                    new Paragraph(" ")
            );


            // ==========================================
            // EMPLOYEE DETAILS
            // ==========================================

            Employee employee =
                    payroll.getEmployee();

            Paragraph employeeHeading =
                    new Paragraph(
                            "EMPLOYEE DETAILS",
                            sectionFont
                    );

            document.add(employeeHeading);

            document.add(
                    new Paragraph(" ")
            );

            PdfPTable employeeTable =
                    new PdfPTable(2);

            employeeTable.setWidthPercentage(100);

            addRow(
                    employeeTable,
                    "Employee Code",
                    employee.getEmployeeCode(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Employee Name",
                    employee.getName(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Department",
                    employee.getDepartment(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Designation",
                    employee.getDesignation(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Email",
                    employee.getEmail(),
                    normalFont
            );

            document.add(employeeTable);

            document.add(
                    new Paragraph(" ")
            );


            // ==========================================
            // EARNINGS + DEDUCTIONS
            // ==========================================

            PdfPTable mainTable =
                    new PdfPTable(2);

            mainTable.setWidthPercentage(100);

            mainTable.setWidths(
                    new float[]{1, 1}
            );


            // ==========================================
            // EARNINGS TABLE
            // ==========================================

            PdfPTable earningsTable =
                    new PdfPTable(2);

            earningsTable.setWidthPercentage(100);

            addHeader(
                    earningsTable,
                    "EARNINGS",
                    sectionFont
            );

            addAmountRow(
                    earningsTable,
                    "Basic Salary",
                    payroll.getBasicSalary(),
                    normalFont
            );

            addAmountRow(
                    earningsTable,
                    "HRA",
                    payroll.getHra(),
                    normalFont
            );

            addAmountRow(
                    earningsTable,
                    "Special Allowance",
                    payroll.getSpecialAllowance(),
                    normalFont
            );

            addAmountRow(
                    earningsTable,
                    "Gross Salary",
                    payroll.getGrossSalary(),
                    boldFont
            );


            // ==========================================
            // DEDUCTIONS TABLE
            // ==========================================

            PdfPTable deductionsTable =
                    new PdfPTable(2);

            deductionsTable.setWidthPercentage(100);

            addHeader(
                    deductionsTable,
                    "DEDUCTIONS",
                    sectionFont
            );

            addAmountRow(
                    deductionsTable,
                    "LOP Deduction",
                    payroll.getDeductions(),
                    normalFont
            );

            addAmountRow(
                    deductionsTable,
                    "PF",
                    payroll.getPf(),
                    normalFont
            );

            addAmountRow(
                    deductionsTable,
                    "ESI",
                    payroll.getEsi(),
                    normalFont
            );

            addAmountRow(
                    deductionsTable,
                    "Professional Tax",
                    payroll.getProfessionalTax(),
                    normalFont
            );

            addAmountRow(
                    deductionsTable,
                    "Total Deductions",
                    payroll.getTotalDeductions(),
                    boldFont
            );


            PdfPCell earningsCell =
                    new PdfPCell(earningsTable);

            earningsCell.setPadding(5);

            PdfPCell deductionsCell =
                    new PdfPCell(deductionsTable);

            deductionsCell.setPadding(5);

            mainTable.addCell(earningsCell);
            mainTable.addCell(deductionsCell);

            document.add(mainTable);

            document.add(
                    new Paragraph(" ")
            );


            // ==========================================
            // NET SALARY
            // ==========================================

            PdfPTable netTable =
                    new PdfPTable(2);

            netTable.setWidthPercentage(100);

            PdfPCell netLabel =
                    new PdfPCell(
                            new Phrase(
                                    "NET SALARY",
                                    netFont
                            )
                    );

            PdfPCell netValue =
                    new PdfPCell(
                            new Phrase(
                                    format(
                                            payroll.getNetSalary()
                                    ),
                                    netFont
                            )
                    );

            netLabel.setPadding(10);
            netValue.setPadding(10);

            netValue.setHorizontalAlignment(
                    Element.ALIGN_RIGHT
            );

            netTable.addCell(netLabel);
            netTable.addCell(netValue);

            document.add(netTable);

            document.add(
                    new Paragraph(" ")
            );

            document.add(
                    new Paragraph(
                            "Generated on: "
                                    + LocalDate.now(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "This is a computer-generated payslip.",
                            normalFont
                    )
            );

            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate payslip PDF",
                    e
            );
        }
    }


    // ==========================================
    // ADD NORMAL ROW
    // ==========================================

    private void addRow(
            PdfPTable table,
            String label,
            String value,
            Font font) {

        PdfPCell labelCell =
                new PdfPCell(
                        new Phrase(label, font)
                );

        PdfPCell valueCell =
                new PdfPCell(
                        new Phrase(
                                value != null
                                        ? value
                                        : "",
                                font
                        )
                );

        labelCell.setPadding(6);
        valueCell.setPadding(6);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }


    // ==========================================
    // ADD TABLE HEADER
    // ==========================================

    private void addHeader(
            PdfPTable table,
            String title,
            Font font) {

        PdfPCell header =
                new PdfPCell(
                        new Phrase(title, font)
                );

        header.setColspan(2);
        header.setPadding(7);

        header.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );

        table.addCell(header);
    }


    // ==========================================
    // ADD AMOUNT ROW
    // ==========================================

    private void addAmountRow(
            PdfPTable table,
            String label,
            BigDecimal amount,
            Font font) {

        PdfPCell labelCell =
                new PdfPCell(
                        new Phrase(label, font)
                );

        PdfPCell amountCell =
                new PdfPCell(
                        new Phrase(
                                format(amount),
                                font
                        )
                );

        labelCell.setPadding(6);
        amountCell.setPadding(6);

        amountCell.setHorizontalAlignment(
                Element.ALIGN_RIGHT
        );

        table.addCell(labelCell);
        table.addCell(amountCell);
    }


    // ==========================================
    // FORMAT MONEY
    // ==========================================

    private String format(BigDecimal amount) {

        if (amount == null) {
            return "₹0.00";
        }

        return "₹"
                + amount
                .setScale(2)
                .toPlainString();
    }
}