package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.Payroll;
import com.example.hrm.payroll.entity.PayslipEmail;
import com.example.hrm.payroll.repository.PayslipEmailRepository;

import jakarta.mail.internet.MimeMessage;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PayslipEmailService {

    private final JavaMailSender mailSender;
    private final PayslipEmailRepository payslipEmailRepository;
    private final PayslipPdfService payslipPdfService;

    public PayslipEmailService(
            JavaMailSender mailSender,
            PayslipEmailRepository payslipEmailRepository,
            PayslipPdfService payslipPdfService) {

        this.mailSender = mailSender;
        this.payslipEmailRepository = payslipEmailRepository;
        this.payslipPdfService = payslipPdfService;
    }

    public PayslipEmail sendPayslip(Payroll payroll) {
        Optional<PayslipEmail> existingEmail = payslipEmailRepository .findByPayrollIdAndStatus( payroll.getId(), "SENT" );
        if (existingEmail.isPresent())
        { System.out.println( "Payslip already sent for payroll ID: " + payroll.getId() );
            return existingEmail.get();
        }

        String email = payroll.getEmployee().getEmail();

        // ----------------------------------------
        // 1. Create log
        // ----------------------------------------

        PayslipEmail log = new PayslipEmail();

        log.setPayroll(payroll);
        log.setEmployee(payroll.getEmployee());
        log.setEmail(email);
        log.setStatus("PENDING");

        log = payslipEmailRepository.saveAndFlush(log);

        try {

            // ----------------------------------------
            // 2. Generate PDF
            // ----------------------------------------

            byte[] pdf =
                    payslipPdfService.generatePayslip(payroll);

            String fileName =
                    "Payslip_"
                            + payroll.getEmployee().getEmployeeCode()
                            + "_"
                            + payroll.getMonth()
                            + "_"
                            + payroll.getYear()
                            + ".pdf";

            // ----------------------------------------
            // 3. Create email
            // ----------------------------------------

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true);

            helper.setTo(email);

            helper.setSubject(
                    "Salary Payslip - "
                            + payroll.getMonth()
                            + "/"
                            + payroll.getYear()
            );

            helper.setText(
                    "Dear "
                            + payroll.getEmployee().getName()
                            + ",\n\n"
                            + "Please find your salary payslip attached."
                            + "\n\n"
                            + "Regards,\n"
                            + "HRM System"
            );

            helper.addAttachment(
                    fileName,
                    new ByteArrayResource(pdf)
            );

            // ----------------------------------------
            // 4. Send email
            // ----------------------------------------

            mailSender.send(message);

            // ----------------------------------------
            // 5. Update log
            // ----------------------------------------

            log.setStatus("SENT");
            log.setSentAt(LocalDateTime.now());
            log.setErrorMessage(null);

            return payslipEmailRepository.saveAndFlush(log);

        } catch (Exception e) {

            // ----------------------------------------
            // 6. Email failed
            // ----------------------------------------

            log.setStatus("FAILED");

            String error = e.getMessage();

            if (error == null) {
                error = e.getClass().getSimpleName();
            }

            log.setErrorMessage(error);

            payslipEmailRepository.saveAndFlush(log);

            throw new RuntimeException(
                    "Failed to send payslip email: " + error,
                    e
            );
        }
    }
}