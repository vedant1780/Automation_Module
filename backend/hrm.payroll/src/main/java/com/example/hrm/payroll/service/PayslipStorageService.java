package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.Payroll;
import com.example.hrm.payroll.exception.PayslipGenerationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class PayslipStorageService {

    private final Path storageRoot;

    public PayslipStorageService(
            @Value("${payslip.storage.dir:./payslips}") String storageDir) {
        this.storageRoot = Paths.get(storageDir).toAbsolutePath().normalize();
    }

    public String store(Payroll payroll, byte[] pdfBytes) {
        try {
            Files.createDirectories(storageRoot);

            String fileName = "payslip_%d_%d_%d.pdf".formatted(
                    payroll.getEmployee().getId(), payroll.getYear(), payroll.getMonth());

            Path filePath = storageRoot.resolve(fileName);
            Files.write(filePath, pdfBytes);

            return filePath.toString();

        } catch (IOException e) {
            throw new PayslipGenerationException(
                    "Failed to save payslip PDF for payroll ID: " + payroll.getId(), e);
        }
    }
}