package com.learn.java.filetransfer.repository;

import com.learn.java.filetransfer.dto.Connection;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends CrudRepository<Connection, Integer> {
    Optional<Connection> findByCurrentUserWebSocketIdAndStatus(String currentUserWebSocketId, String status);

    Optional<Connection> findByAnotherUserWebSocketIdAndStatus(String anotherUserWebSocketId, String status);

//    List<Connection> findConnectionsByCurrentUserId(String currentUserId);

    List<Connection> findConnectionByCurrentUserWebSocketId(String currentUserWebSocketId);

    List<Connection> findByCurrentUserIdOrAnotherUserId(String currentUserId, String anotherUserId);

    @Modifying
    @Transactional
    @Query("UPDATE Connection c SET c.currentUserId = :newUsername, c.anotherUserId = :newUsername WHERE c.currentUserId = :prevUsername OR c.anotherUserId = :prevUsername")
    int updateConnectionByUsername(String newUsername, String prevUsername);

    @Modifying
    @Transactional
    @Query(" update Connection c set c.currentUserId = :newUsername where c.currentUserId = :prevUsername ")
    int updateConnectionByUsernameCurrent(String newUsername, String prevUsername);

    @Modifying
    @Transactional
    @Query(" update Connection c set c.anotherUserId = :newUsername where c.anotherUserId = :prevUsername ")
    int updateConnectionByUsernameAnother(String newUsername, String prevUsername);
}
