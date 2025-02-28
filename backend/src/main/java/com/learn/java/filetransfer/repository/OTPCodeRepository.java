package com.learn.java.filetransfer.repository;

import com.learn.java.filetransfer.dto.OTPCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OTPCodeRepository extends JpaRepository<OTPCode, Integer> {
    Optional<OTPCode> findByUsername(String username);
    void deleteByUsername(String username);
}
