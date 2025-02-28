package com.learn.java.filetransfer.service;


import com.learn.java.filetransfer.dto.OTPCode;
import com.learn.java.filetransfer.repository.OTPCodeRepository;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;
import org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class EmailService {

    private final FreeMarkerConfigurer freeMarkerConfigurer;
    private final JavaMailSender emailSender;
    private final OTPCodeRepository otpCodeRepository;

    public EmailService(FreeMarkerConfigurer freeMarkerConfigurer, JavaMailSender emailSender, OTPCodeRepository otpCodeRepository) {
        this.freeMarkerConfigurer = freeMarkerConfigurer;
        this.emailSender = emailSender;
        this.otpCodeRepository = otpCodeRepository;
    }


    public void sendMessageUsingFreemarkerTemplate(String username,
            String to, String subject, Map<String, Object> templateModel) {
        try {
            int code = generateRandomCode();
            templateModel.put("text",code+"");
            Template freemarkerTemplate = freeMarkerConfigurer.getConfiguration()
                    .getTemplate("freeMarker.ftl");
            String htmlBody = FreeMarkerTemplateUtils.processTemplateIntoString(freemarkerTemplate, templateModel);
            pushCodeToDB(code, username);
            sendHtmlMessage(to, subject, htmlBody);
        } catch (IOException | TemplateException e) {
            throw new IllegalArgumentException("Failed to process email template", e);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(e);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void sendHtmlMessage(String to, String subject, String htmlBody) {
        try {
            String FROM_EMAIL = "noreplay@filetransferdemo.com";
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setFrom(FROM_EMAIL);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            emailSender.send(message);
        } catch (MessagingException | MailException e) {
            throw new IllegalArgumentException("Failed to send email", e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public int generateRandomCode() {
        Random random = new Random();
        return random.nextInt(100000, 999999);
    }

    public void pushCodeToDB(int code, String username) {
        // Code to push code to DB
        Optional<OTPCode> otpCodeOptional = otpCodeRepository.findByUsername(username);
        if (otpCodeOptional.isPresent()){
            OTPCode otpCode = otpCodeOptional.get();
            otpCode.setCode(code);
            otpCodeRepository.save(otpCode);
        } else {
            OTPCode otpCode = new OTPCode();
            otpCode.setUsername(username);
            otpCode.setCode(code);
            otpCode.setCreatedTime(LocalDateTime.now());
            otpCode.setId(0);
            otpCode.setExpiryTime(LocalDateTime.now().plusMinutes(10));
            otpCodeRepository.save(otpCode);
        }
    }

}
