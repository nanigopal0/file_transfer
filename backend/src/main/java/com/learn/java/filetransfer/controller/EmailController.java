package com.learn.java.filetransfer.controller;

import com.learn.java.filetransfer.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send-email")
    public ResponseEntity<String> sendEmail(@RequestBody Map<String, String> email) {
        try {
            String to = email.get("to");
            String subject = "Your single-use code";
            Map<String ,Object> map = new HashMap<>();
            map.put("senderName","Nani");
            map.put("recipientEmail",email.get("to"));
            emailService.sendMessageUsingFreemarkerTemplate(email.get("username"),to,subject,map);

            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
