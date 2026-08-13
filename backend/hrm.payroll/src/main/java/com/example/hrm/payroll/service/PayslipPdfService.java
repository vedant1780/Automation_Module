package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.Payroll;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PayslipPdfService {

    public byte[] generatePayslip(Payroll payroll) {

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, outputStream);

            document.open();

            // Company heading
            Paragraph title = new Paragraph(
                    "EMPLOYEE PAYSLIP",
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            20
                    )
            );

            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(" "));

            // Employee details
            document.add(new Paragraph(
                    "Employee Code: "
                            + payroll.getEmployee().getEmployeeCode()
            ));

            document.add(new Paragraph(
                    "Employee Name: "
                            + payroll.getEmployee().getName()
            ));

            document.add(new Paragraph(
                    "Department: "
                            + payroll.getEmployee().getDepartment()
            ));

            document.add(new Paragraph(
                    "Designation: "
                            + payroll.getEmployee().getDesignation()
            ));

            document.add(new Paragraph(
                    "Pay Period: "
                            + payroll.getMonth()
                            + "/"
                            + payroll.getYear()
            ));

            document.add(new Paragraph(" "));

            // Salary table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);

            table.addCell("Salary Component");
            table.addCell("Amount");

            table.addCell("Basic Salary");
            table.addCell(
                    payroll.getBasicSalary().toString()
            );

            table.addCell("HRA");
            table.addCell(
                    payroll.getHra().toString()
            );

            table.addCell("Special Allowance");
            table.addCell(
                    payroll.getSpecialAllowance().toString()
            );

            table.addCell("Gross Salary");
            table.addCell(
                    payroll.getGrossSalary().toString()
            );

            table.addCell("LOP / Attendance Deduction");
            table.addCell(
                    payroll.getDeductions().toString()
            );

            table.addCell("PF");
            table.addCell(
                    payroll.getPf().toString()
            );

            table.addCell("ESI");
            table.addCell(
                    payroll.getEsi().toString()
            );

            table.addCell("Professional Tax");
            table.addCell(
                    payroll.getProfessionalTax().toString()
            );

            table.addCell("Total Deductions");
            table.addCell(
                    payroll.getTotalDeductions().toString()
            );

            table.addCell("NET SALARY");
            table.addCell(
                    payroll.getNetSalary().toString()
            );

            document.add(table);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(
                    "This is a system generated payslip."
            ));

            document.close();

        } catch (Exception e) {
            throw new RuntimeException(
                    "Error generating payslip PDF",
                    e
            );
        }

        return outputStream.toByteArray();
    }
}