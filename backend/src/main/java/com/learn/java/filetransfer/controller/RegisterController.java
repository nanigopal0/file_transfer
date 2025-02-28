package com.learn.java.filetransfer.controller;


import com.learn.java.filetransfer.dto.User;
import com.learn.java.filetransfer.exception.UserNotFoundException;
import com.learn.java.filetransfer.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/register")
public class RegisterController {

    private final UserService userService;

    RegisterController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> login(@RequestBody Map<String,String > user) {
        try {
            return ResponseEntity.ok(userService.loginUser(user.get("identifier"), user.get("password")));
        } catch (IllegalArgumentException | UserNotFoundException e) {
            Map<String,Object> map = new HashMap<>();
            map.put("error",e.getMessage());
            return ResponseEntity.badRequest().body(map);
        }
        catch (Exception e) {
            Map<String,Object> map = new HashMap<>();
            map.put("error",e.getMessage());
            return ResponseEntity.internalServerError().body(map);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String,Object>> signup(@RequestBody User user) {
        try {
            return ResponseEntity.ok().body(userService.addUser(user));
        } catch (RuntimeException e) {
            Map<String,Object> map = new HashMap<>();
            map.put("error",e.getMessage());
            return ResponseEntity.badRequest().body(map);
        }
    }


}
