package com.learn.java.filetransfer.repository;

import com.learn.java.filetransfer.dto.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends CrudRepository<User, Integer> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    List<User> findByUsernameStartingWithOrFullNameStartingWith(String username, String fullName);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.username = :username AND u.id != :currentUserId")
    boolean existsByUsernameAndNotCurrentUser(@Param("username") String username, @Param("currentUserId") int currentUserId);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.id != :currentUserId")
    boolean existsByEmailAndNotCurrentUser(@Param("email") String email, @Param("currentUserId") int currentUserId);


    @Modifying
    @Transactional
    @Query(" update User u set u.username = :newUsername where u.username = :prevUsername ")
    int updateUserByUsername(String newUsername, String prevUsername);
}
