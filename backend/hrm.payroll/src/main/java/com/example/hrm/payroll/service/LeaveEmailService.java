package com.example.hrm.payroll.service;

import com.example.hrm.payroll.entity.Employee;
import com.example.hrm.payroll.entity.LeaveApplication;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class LeaveEmailService {
    private final JavaMailSender mailSender;

    public LeaveEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    } // ========================================================= // SEND LEAVE APPROVED EMAIL // =========================================================

    public void sendLeaveApprovedEmail(LeaveApplication leave) {
        Employee employee = leave.getEmployee();
        String employeeEmail = employee.getEmail();
        if (employeeEmail == null || employeeEmail.isBlank()) {
            System.out.println("Employee email not available. " + "Leave approval email not sent.");
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(employeeEmail);
        message.setSubject("Leave Application Approved");
        String employeeName = employee.getName();
        String body = "Dear " + employeeName + ",\n\n" + "Your leave application has been APPROVED.\n\n" + "Leave Details:\n" + "----------------------------\n" + "Leave Type: " + leave.getLeaveType() + "\n" + "Start Date: " + leave.getStartDate() + "\n" + "End Date: " + leave.getEndDate() + "\n" + "Number of Days: " + leave.getNumberOfDays() + "\n" + "Status: APPROVED\n" + "----------------------------\n\n" + "Please contact HR if you have any questions.\n\n" + "Regards,\n" + "HR Management System";
        message.setText(body);
        try {
            mailSender.send(message);
            System.out.println("Leave approval email sent to: " + employeeEmail);
        } catch (Exception e) {
            System.out.println("Failed to send leave approval email: " + e.getMessage());
        }
    } // ========================================================= // SEND LEAVE REJECTED EMAIL // =========================================================

    public void sendLeaveRejectedEmail(LeaveApplication leave) {
        Employee employee = leave.getEmployee();
        String employeeEmail = employee.getEmail();
        if (employeeEmail == null || employeeEmail.isBlank()) {
            System.out.println("Employee email not available. " + "Leave rejection email not sent.");
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(employeeEmail);
        message.setSubject("Leave Application Rejected");
        String employeeName = employee.getName();
        String body = "Dear " + employeeName + ",\n\n" + "Your leave application has been REJECTED.\n\n" + "Leave Details:\n" + "----------------------------\n" + "Leave Type: " + leave.getLeaveType() + "\n" + "Start Date: " + leave.getStartDate() + "\n" + "End Date: " + leave.getEndDate() + "\n" + "Number of Days: " + leave.getNumberOfDays() + "\n" + "Status: REJECTED\n" + "----------------------------\n\n" + "Please contact HR for more information.\n\n" + "Regards,\n" + "HR Management System";
        message.setText(body);
        try {
            mailSender.send(message);
            System.out.println("Leave rejection email sent to: " + employeeEmail);
        } catch (Exception e) {
            System.out.println("Failed to send leave rejection email: " + e.getMessage());
        }
    }
}