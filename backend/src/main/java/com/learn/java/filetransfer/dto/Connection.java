package com.learn.java.filetransfer.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Connection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String currentUserId;
    private String currentUserFullName;
    private String anotherUserFullName;
    private String fileName;
    private String anotherUserId;
    private String currentUserWebSocketId;
    private String anotherUserWebSocketId;
    @Column(nullable = false)
    private String status;
    private String connectionDate;
    @Column(nullable = false)
    private int connectionCode;
    private int attempt;
//    @ManyToOne
//    @JoinColumn(name = "user_id")
//    @JsonIgnore
//    private User user;
}
