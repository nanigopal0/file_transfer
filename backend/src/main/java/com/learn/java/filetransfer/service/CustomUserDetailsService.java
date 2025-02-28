package com.learn.java.filetransfer.service;

import com.learn.java.filetransfer.dto.User;
import com.learn.java.filetransfer.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOptionalByUsername = userRepository.findByUsername(username);
        Optional<User> userOptionalByEmail = userRepository.findByEmail(username);
        if (userOptionalByEmail.isPresent() || userOptionalByUsername.isPresent()) {
            boolean isEmail = userOptionalByEmail.isPresent();
            User user = userOptionalByEmail.orElseGet(userOptionalByUsername::get);
           return org.springframework.security.core.userdetails.User.builder()
                    .username(isEmail ? user.getEmail() : user.getUsername())
                    .password(user.getPassword())
                    .roles(user.getRole())
                   .build();

        } else throw new UsernameNotFoundException("User not found");
    }


}
