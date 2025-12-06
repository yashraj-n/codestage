package com.yashrajn.codestageserver.services;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;
import com.yashrajn.codestageserver.auth.JwtCandidate;
import com.yashrajn.codestageserver.auth.JwtService;
import com.yashrajn.codestageserver.auth.JwtAdmin;
import com.yashrajn.codestageserver.models.dto.CreateAssessmentDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class MailService {
    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final Mustache.Compiler mustacheCompiler;
    private final ClassPathResource inviteTemplate = new ClassPathResource("templates/assessment-invite.mustache");
    private final String clientUrl;
    private final JwtService jwtService;

    MailService(JavaMailSender mailSender,
                @Value("${email.from}") String fromEmail,
                Mustache.Compiler mustacheCompiler,
                @Value("${client.url}") String clientUrl,
                JwtService jwtService) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.mustacheCompiler = mustacheCompiler;
        this.clientUrl = clientUrl;
        this.jwtService = jwtService;
    }

    public void sendEmailToCandidate(CreateAssessmentDTO assessmentDTO, JwtAdmin user, String sessionId) throws MessagingException, IOException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        String joinToken = jwtService.generateCandidateJwtToken(sessionId, new JwtCandidate(assessmentDTO.candidateEmail(), assessmentDTO.candidateName()));
        String inviteTemplateHTML = renderInviteTemplate(assessmentDTO, user, clientUrl + "/join?token=" + joinToken);

        helper.setFrom("CodeStage Assessment <" + fromEmail + ">");
        helper.setTo(assessmentDTO.candidateName() + "<" + assessmentDTO.candidateEmail() + ">");
        helper.setSubject("You have been invited to a CodeStage Assessment");
        helper.setText(inviteTemplateHTML, true);

        mailSender.send(message);

    }

    private String renderInviteTemplate(CreateAssessmentDTO assessmentDTO, JwtAdmin user, String assessmentLink) throws IOException {
        try (var reader = inviteTemplate.getInputStream()) {
            String templateText = new String(reader.readAllBytes());
            Template template = mustacheCompiler.compile(templateText);
            return template.execute(Map.of(
                    "candidateName", assessmentDTO.candidateName(),
                    "inviterName", user.getName(),
                    "inviterInitials", user.getName().substring(0, 1).toUpperCase(),
                    "assessmentLink", assessmentLink,
                    "assessmentNotes", assessmentDTO.assessmentNotes()
            ));
        }
    }

}
