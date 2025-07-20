package com.learn.java.filetransfer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
public class TestController {

    @GetMapping("/get")
    public ResponseEntity<String> say() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println(authentication.getPrincipal());
        return ResponseEntity.ok("Hello " + authentication.getPrincipal() + " " + authentication.getDetails() + " "
                + authentication.getAuthorities() + " " + authentication.getName());
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
       return ResponseEntity.ok("pong");
    }


}
