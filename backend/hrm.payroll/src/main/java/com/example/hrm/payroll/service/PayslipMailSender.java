package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.Payroll;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import jakarta.mail.internet.MimeMessage;
import java.io.File;

@Component
public class PayslipMailSender {

    private final JavaMailSender mailSender;

    public PayslipMailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void send(String toEmail, String pdfPath, Payroll payroll) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject("Payslip for " + payroll.getMonth() + "/" + payroll.getYear());
        helper.setText("Please find your payslip attached.");

        File pdfFile = new File(pdfPath);
        if (!pdfFile.exists()) {
            throw new IllegalStateException("Payslip PDF not found at path: " + pdfPath);
        }
        helper.addAttachment(pdfFile.getName(), pdfFile);

        mailSender.send(message);
    }
}