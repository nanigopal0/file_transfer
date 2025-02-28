package com.learn.java.filetransfer.service;


import com.learn.java.filetransfer.dto.User;
import com.learn.java.filetransfer.exception.UserNotFoundException;
import com.learn.java.filetransfer.jwt.JwtService;
import com.learn.java.filetransfer.repository.ConnectionRepository;
import com.learn.java.filetransfer.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ConnectionRepository connectionRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, ConnectionRepository connectionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.connectionRepository = connectionRepository;
    }

    public Map<String,Object> addUser(User user) {
        try {
            user.setUsername("user" + UUID.randomUUID().toString().substring(0, 8));
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRole("USER");
            User savedUser = userRepository.save(user);
            Map<String,Object> map = new HashMap<>();
            map.put("token",jwtService.generateToken(user.getUsername()));
            map.put("user",savedUser);
            return map;
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Email is already exist");
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public Map<String,Object> loginUser(String emailOrUsername, String password) {
        String username = emailOrUsername;
        User savedUser = null;
        if (emailValidator(emailOrUsername)) {
            Optional<User> userOptional = userRepository.findByEmail(emailOrUsername);
            if(userOptional.isPresent()) {
                savedUser = userOptional.get();
                username = userOptional.get().getUsername();
            } else throw new UserNotFoundException("User not found");
        }

        if(usernameValidator(username))
            savedUser = userRepository.findByUsername(username).orElse(null);

        Authentication authReq = UsernamePasswordAuthenticationToken.unauthenticated(username, password);
        Authentication authResponse = authenticationManager.authenticate(authReq);
        if (authResponse.isAuthenticated()){
            Map<String,Object> map = new HashMap<>();
            map.put("token",jwtService.generateToken(username));
            map.put("user",savedUser);
            return map;
        }
        else throw new IllegalArgumentException("Failed to logged in");
    }

    public String deleteUser(String target) {
        try {
            Optional<User> userOptional;
            if (emailValidator(target))
                userOptional = userRepository.findByEmail(target);
            else if (usernameValidator(target))
                userOptional = userRepository.findByUsername(target);
            else {
                try {
                    int id = Integer.parseInt(target);
                    userOptional = userRepository.findById(id);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Invalid ID format");
                }
            }

            if (userOptional.isPresent()) {
                User dbUser = userOptional.get();
                userRepository.deleteById(dbUser.getId());
                return "Deleted user " + dbUser.getUsername();
            }
            throw new UserNotFoundException("User not found");
        } catch (UserNotFoundException | IllegalArgumentException e) {
            throw new UserNotFoundException(e.getMessage());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new RuntimeException("An unexpected error occurred ", e);
        }
    }

    public List<User> searchUserByKey(String key) {
        return userRepository.findByUsernameStartingWithOrFullNameStartingWith(key, key);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User getUserById(int id) {
        return userRepository.findById(id).orElse(null);
    }

    public User saveUser (User user) {
        return userRepository.save(user);
    }

    private boolean emailValidator(String email) {
        if (email == null) return false;
        String emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$";
        return Pattern.compile(emailPattern).matcher(email).matches();
    }

    private boolean usernameValidator(String username) {
        if (username == null) return false;
        String usernamePattern = "user[0-9]{8}";
        return Pattern.compile(usernamePattern).matcher(username).matches();
    }


    public String updateUser(User user) {

        Optional<User> userOptional = userRepository.findById(user.getId());
        if (userOptional.isPresent()) {
            User dbUser = userOptional.get();
            dbUser.setFullName(user.getFullName());
            if(userRepository.existsByEmailAndNotCurrentUser(dbUser.getEmail(), dbUser.getId()))
                    throw new IllegalArgumentException("Email is already exist");
            dbUser.setEmail(user.getEmail());

            if(userRepository.existsByUsernameAndNotCurrentUser(dbUser.getUsername(), dbUser.getId()))
                    throw new IllegalArgumentException("Username is already exist");


            connectionRepository.updateConnectionByUsernameCurrent(user.getUsername(),dbUser.getUsername());
            connectionRepository.updateConnectionByUsernameAnother(user.getUsername(),dbUser.getUsername());
            dbUser.setUsername(user.getUsername());
            userRepository.save(dbUser);
            return jwtService.generateToken(dbUser.getUsername());
        }
        throw new UserNotFoundException("User not found");
    }
}
