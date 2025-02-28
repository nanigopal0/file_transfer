package com.learn.java.filetransfer.service;


import com.learn.java.filetransfer.dto.Connection;
import com.learn.java.filetransfer.dto.User;
import com.learn.java.filetransfer.repository.ConnectionRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;

    public ConnectionService(ConnectionRepository connectionRepository) {
        this.connectionRepository = connectionRepository;
    }

    public Connection getConnectionById(int id) {
        return connectionRepository.findById(id).orElse(null);
    }

    public Connection saveConnection(Connection connection) {
        return connectionRepository.save(connection);
    }

    public List<Connection> getConnectionsByCurrentUserWebsocketId(String websocketId) {
        return connectionRepository.findConnectionByCurrentUserWebSocketId(websocketId);
    }


    public static int[] generateThreeRandomConnectionCode() {
        int[] arr = new int[3];
        do {
            arr[0] = generateConnectionCode();
            arr[1] = generateConnectionCode();
            arr[2] = generateConnectionCode();
        } while (arr[0] == arr[1] || arr[1] == arr[2] || arr[0] == arr[2]);
        return arr;
    }

    public static String getCurrentDateTime() {
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return LocalDateTime.now().format(dateTimeFormatter);
    }

    public static int generateConnectionCode() {
        Random random = new Random();
        return random.nextInt(10, 100);
    }


}
