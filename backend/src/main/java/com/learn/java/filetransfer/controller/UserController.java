package com.learn.java.filetransfer.controller;


import com.learn.java.filetransfer.dto.User;
import com.learn.java.filetransfer.exception.UserNotFoundException;
import com.learn.java.filetransfer.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    UserController(UserService userService) {
        this.userService = userService;
    }


    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteUser(@RequestParam("target") String target) {
        try {
            String result = userService.deleteUser(target);
            return ResponseEntity.status(204).body(result);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUser(@RequestParam("key") String key){
        try{
            return ResponseEntity.ok(userService.searchUserByKey(key));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateUser(@RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.updateUser(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
        catch (UserNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

}
