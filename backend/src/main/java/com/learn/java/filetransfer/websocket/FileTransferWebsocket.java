package com.learn.java.filetransfer.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.learn.java.filetransfer.dto.Connection;
import com.learn.java.filetransfer.dto.FileMessage;
import com.learn.java.filetransfer.dto.User;
import com.learn.java.filetransfer.jwt.JwtService;
import com.learn.java.filetransfer.repository.ConnectionRepository;
import com.learn.java.filetransfer.service.ConnectionService;
import com.learn.java.filetransfer.service.CustomUserDetailsService;
import com.learn.java.filetransfer.service.UserService;
import com.learn.java.filetransfer.status.ConnectionStatus;
import com.learn.java.filetransfer.status.ConnectionStatusCode;
import jakarta.websocket.server.ServerEndpoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.*;


@Slf4j
@ServerEndpoint("/transfer")
@Component
public class FileTransferWebsocket implements WebSocketHandler {

    private final ConnectionRepository connectionRepository;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtService jwtService;
    private final UserService userService;
    private final Map<String, WebSocketSession> sessionMap = new HashMap<>();
    private final Map<String, String> usernameWebSocketIdMap = new HashMap<>();
    private final Map<String, String> webSocketIdUsernameMap = new HashMap<>();
    private final ConnectionService connectionService;
    ObjectMapper objectMapper = new ObjectMapper();

    public FileTransferWebsocket(ConnectionRepository connectionRepository, CustomUserDetailsService customUserDetailsService, JwtService jwtService, UserService userService, ConnectionService connectionService) {
        this.connectionRepository = connectionRepository;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtService = jwtService;
        this.userService = userService;
        this.connectionService = connectionService;
    }


    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        try {
//            System.out.println("Connection established. " + session.getId());
            sessionMap.put(session.getId(), session);
//            Map<String, String> map = new HashMap<>();
//            map.put("statusCode", String.valueOf(ConnectionStatusCode.SEND_ID));
//            map.put("id", session.getId());
//            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(map)));
        } catch (Exception e) {
            log.debug(e.getMessage());
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) {

        try {
            session.setTextMessageSizeLimit(1024 * 1024); // Set size limit for text messages
            session.setBinaryMessageSizeLimit(1024 * 64); // Set size limit for binary messages
            if (message instanceof TextMessage) {
                receiveTextMessageHandler(session, (TextMessage) message);
            } else if (message instanceof BinaryMessage) {
                String receiverId = session.getAttributes().getOrDefault("anotherUserId", "").toString();
                if (receiverId.isBlank()) return;
                String receiverSessionId = usernameWebSocketIdMap.get(receiverId);
                WebSocketSession receiverSession = sessionMap.get(receiverSessionId);
                receiverSession.sendMessage(message);
            }
        } catch (Exception e) {
            log.debug(e.getMessage());
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        System.err.println("WebSocket error: " + exception.getMessage() + session.getId());
        log.debug(exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) {
        try {
//            System.out.println("WebSocket connection closed. " + session.getId() + " " + closeStatus.getReason());
            sessionMap.remove(session.getId());
            usernameWebSocketIdMap.remove(webSocketIdUsernameMap.remove(session.getId()));

            sendStatusDisconnectInDB(session);
        } catch (Exception e) {
            log.debug(e.getMessage());
        }
    }

    private void sendStatusDisconnectInDB(WebSocketSession session) {
        String anotherUserId = session.getAttributes().getOrDefault("anotherUserId", "").toString();

        if (anotherUserId.isBlank()) {
            Optional<Connection> connection1 = connectionRepository.findByCurrentUserWebSocketIdAndStatus(session.getId(), ConnectionStatus.PENDING.name());
            if (connection1.isPresent()) {
                Connection connection = connection1.get();
                connection.setStatus(ConnectionStatus.DISCONNECTED.name());
                connectionRepository.save(connection);
                return;
            }
            connectionRepository.findByAnotherUserWebSocketIdAndStatus(session.getId(), ConnectionStatus.PENDING.name()).ifPresent(connection -> {
                if (!ConnectionStatus.DISCONNECTED.name().equals(connection.getStatus())) {
                    connection.setStatus(ConnectionStatus.DISCONNECTED.name());
                    connectionRepository.save(connection);
                }
            });
            return;
        }
        Optional<Connection> connection1 = connectionRepository.findByCurrentUserWebSocketIdAndStatus(session.getId(), ConnectionStatus.CONNECTED.name());
        if (connection1.isPresent()) {
            Connection connection = connection1.get();
            connection.setStatus(ConnectionStatus.DISCONNECTED.name());
            connectionRepository.save(connection);
            sendDisconnectedMessageToAnotherUser(connection.getAnotherUserWebSocketId(), connection.getCurrentUserId(), connection.getAnotherUserId());
            return;
        }
        connectionRepository.findByAnotherUserWebSocketIdAndStatus(session.getId(), ConnectionStatus.CONNECTED.name()).ifPresent(connection -> {
            if (!ConnectionStatus.DISCONNECTED.name().equals(connection.getStatus())) {
                connection.setStatus(ConnectionStatus.DISCONNECTED.name());
                connectionRepository.save(connection);
                sendDisconnectedMessageToAnotherUser(connection.getCurrentUserWebSocketId(), connection.getAnotherUserId(), connection.getCurrentUserId());
            }
        });
    }


    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    public void receiveTextMessageHandler(WebSocketSession session, TextMessage message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message.getPayload());
            int statusCode = jsonNode.get("statusCode").asInt();
            switch (statusCode) {
                case ConnectionStatusCode.SEND_TOKEN_FOR_VERIFYING ->
                        verifyToken(session, jsonNode.get("token").asText());

                case ConnectionStatusCode.DECLINE_CONNECTION_REQUEST -> {       //cancel connection request
                    Connection connection = objectMapper.treeToValue(jsonNode.get("connection"), Connection.class);
                    connection.setStatus(ConnectionStatus.CANCELLED.name());
                    Connection save = connectionRepository.save(connection);
                    HashMap<String, Object> map = new HashMap<>();
                    map.put("statusCode", ConnectionStatusCode.DECLINE_CONNECTION_REQUEST);
                    map.put("payload", save);
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(map)));
                    WebSocketSession senderSession = sessionMap.getOrDefault(connection.getCurrentUserWebSocketId(), null);
                    senderSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(map)));   //send disconnect message to sender
                }

                case ConnectionStatusCode.VERIFY_SELECTED_CODE ->
                        verifySelectedCode(session, jsonNode.get("code").asInt(), jsonNode.get("senderId").asText());

                case ConnectionStatusCode.SEND_NEW_CONNECTION_REQUEST -> {
                    User sender = objectMapper.treeToValue(jsonNode.get("sender"), User.class);
                    User receiver = objectMapper.treeToValue(jsonNode.get("receiver"), User.class);
                    sendNewConnectionRequest(sender, receiver, session.getId());
                }

                case ConnectionStatusCode.REQUEST_TO_SEND_ALL_CONNECTIONS_REQUEST -> sendConnectionHistory(session);

                case ConnectionStatusCode.REQUEST_FOR_DISCONNECTING_CONNECTION -> sendStatusDisconnectInDB(session);

                case ConnectionStatusCode.ACCEPT_TO_RECEIVE_FILE, ConnectionStatusCode.DECLINE_TO_RECEIVE_FILE,
                     ConnectionStatusCode.REQUEST_FOR_RECEIVE_FILE, ConnectionStatusCode.FILE_RECEIVED,
                     ConnectionStatusCode.CANCEL_SEND_FILE -> {
                    String receiverId = session.getAttributes().getOrDefault("anotherUserId", "").toString();
                    String senderId = session.getAttributes().getOrDefault("username", "").toString();

                    String receiverSessionId = usernameWebSocketIdMap.getOrDefault(receiverId, null);
                    if (receiverSessionId == null || receiverId.isBlank()) return; //receiver not found
                    if (jsonNode instanceof ObjectNode objectNode) {
                        objectNode.put("senderId", senderId);
                        objectNode.put("receiverId", receiverId);
                    sessionMap.getOrDefault(receiverSessionId, null).sendMessage(new TextMessage(objectMapper.writeValueAsString(objectNode)));
                    }

                }

                case ConnectionStatusCode.SEND_FILE, ConnectionStatusCode.FILE_SENT -> {
                    String receiverId = session.getAttributes().getOrDefault("anotherUserId", "").toString();
                    if (jsonNode instanceof ObjectNode objectNode) {
                        objectNode.put("senderId", session.getAttributes().getOrDefault("username", "").toString());
                        String receiverSessionId = usernameWebSocketIdMap.getOrDefault(receiverId, null);
                        WebSocketSession receiverSession = sessionMap.get(receiverSessionId);
                        receiverSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(objectNode)));
                    }
                }

                case ConnectionStatusCode.GET_CONNECTION_IF_EXIST -> getConnectionIfExist(session);

                case ConnectionStatusCode.SEARCH_USER -> {
                    String username = session.getAttributes().getOrDefault("username", "").toString();
                    List<User> users = new ArrayList<>();
                    if (!username.isBlank()) {
                        String searchKey = jsonNode.get("searchKey").asText();
                        users = userService.searchUserByKey(searchKey).stream().filter(user -> !user.getUsername().equals(username)).toList();
                    }
                    Map<String, Object> map = new HashMap<>();
                    map.put("statusCode", ConnectionStatusCode.SEARCH_USER_RESULT);
                    map.put("payload", users);
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(map)));
                }

                case ConnectionStatusCode.GET_USER_BY_USERNAME -> {
                    String username = jsonNode.get("username").asText();
                    User user = userService.getUserByUsername(username);
                    HashMap<String, Object> map = new HashMap<>();
                    map.put("statusCode", ConnectionStatusCode.GET_USER_BY_USERNAME);
                    map.put("payload", user);
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(map)));

                }

                case ConnectionStatusCode.WEBRTC -> {
                    String anotherUserId = session.getAttributes().get("anotherUserId").toString();
                    sessionMap.get(usernameWebSocketIdMap.get(anotherUserId)).sendMessage(new TextMessage(message.getPayload()));
                }
            }
        } catch (Exception e) {
            log.debug(e.getMessage());
        }
    }

    private void sendDisconnectedMessageToAnotherUser(String sessionId, String senderId, String receiverId) {
        try {
            if (sessionId != null) {
                WebSocketSession senderSession = sessionMap.getOrDefault(sessionId, null);
                FileMessage message = new FileMessage();
                message.setDate(ConnectionService.getCurrentDateTime());
                message.setStatusCode(ConnectionStatusCode.DISCONNECTED_CONNECTION);
                message.setSenderId(senderId);
                message.setReceiverId(receiverId);
                message.setContent(ConnectionStatus.DISCONNECTED.name());
                senderSession.sendMessage(new TextMessage(objectMapper.writeValueAsBytes(message)));//send message to another that current disconnected
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void sendConnectionRequestMessage(Connection connection, int[] code, int statusCode) {
        try {
            Map<String, Object> map = new HashMap<>();
            map.put("statusCode", statusCode);
            map.put("payload", connection);
            WebSocketSession senderSession = sessionMap.getOrDefault(usernameWebSocketIdMap.get(connection.getCurrentUserId()), null);
            senderSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(map))); //send the connection code to the sender
            String receiverWebsocketId = usernameWebSocketIdMap.getOrDefault(connection.getAnotherUserId(), null);
            if (receiverWebsocketId == null) return;    //receiver not connected yet
            WebSocketSession receiverSession = sessionMap.get(receiverWebsocketId);
            connection.setConnectionCode(Integer.parseInt("" + code[0] + code[1] + code[2]));
            map.put("payload", connection);
            receiverSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(map)));
        } catch (IOException e) {
            log.debug(e.getMessage());
        }
    }

    private void sendConnectionHistory(WebSocketSession session) {
        try {
            String username = session.getAttributes().get("username").toString();
            List<Connection> pendingConnections = new ArrayList<>();
            List<Connection> connections = connectionRepository.findByCurrentUserIdOrAnotherUserId(username, username);
            if (connections.isEmpty()) return;
            Random random = new Random();
            List<Connection> connections1 = connections.stream().peek(connection -> {

                if (Objects.equals(connection.getStatus(), ConnectionStatus.PENDING.name())) {
                    int[] codes = ConnectionService.generateThreeRandomConnectionCode();
                    Connection pending =
                            new Connection(connection.getId(), connection.getCurrentUserId(), connection.getCurrentUserFullName(), connection.getAnotherUserFullName(),
                                    connection.getFileName(), connection.getAnotherUserId(), connection.getCurrentUserWebSocketId(), connection.getAnotherUserWebSocketId(),
                                    connection.getStatus(), connection.getConnectionDate(), codes[random.nextInt(3)], connection.getAttempt());
                    pendingConnections.add(pending);
                    connection.setConnectionCode(Integer.parseInt("" + codes[0] + codes[1] + codes[2]));
                }

            }).toList();
            connectionRepository.saveAll(pendingConnections);
            Map<String, Object> map = new HashMap<>();
            map.put("statusCode", ConnectionStatusCode.SEND_NEW_CONNECTION_REQUEST);
            pendingConnections.forEach(connection -> {
                try {
                    map.put("payload", connection);
                    WebSocketSession session1 = sessionMap.get(usernameWebSocketIdMap.get(connection.getCurrentUserId()));
                    session1.sendMessage(new TextMessage(objectMapper.writeValueAsString(map)));    //send message to sender
                    map.remove("payload");
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
            Map<String, Object> map1 = new HashMap<>();
            map1.put("statusCode", ConnectionStatusCode.SEND_ALL_CONNECTIONS_REQUEST);
            map1.put("payload", connections1);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(map1)));
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    private void setConnectionAfterSuccessfullyEnteredCode(Connection connection) { //connected connection
        try {
            connection.setStatus(ConnectionStatus.CONNECTED.name());
            connectionService.saveConnection(connection);
            Map<String, Integer> map = new HashMap<>();
            map.put("statusCode", ConnectionStatusCode.CONNECTED_CONNECTION);
            sessionMap.getOrDefault(connection.getAnotherUserWebSocketId(), null).sendMessage(new TextMessage(objectMapper.writeValueAsBytes(map)));
            sessionMap.getOrDefault(connection.getCurrentUserWebSocketId(), null).sendMessage(new TextMessage(objectMapper.writeValueAsBytes(map)));
        } catch (Exception e) {
            log.debug(e.getMessage());
        }
    }

    private void sendNewConnectionRequest(User sender, User receiver, String senderWebSocketId) {
        try {
            if (isConnectionRequestAlreadySent(senderWebSocketId)) {
                FileMessage message = new FileMessage();
                message.setStatusCode(ConnectionStatusCode.CONNECTION_REQUEST_ALREADY_SENT);
                message.setDate(ConnectionService.getCurrentDateTime());
                sessionMap.get(senderWebSocketId).sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
                return;
            }
            int[] codes = ConnectionService.generateThreeRandomConnectionCode();
            Random random = new Random();
            int selectedCodeIndex = random.nextInt(3);
            Connection connection = new Connection(
                    0, sender.getUsername(), sender.getFullName(), receiver.getFullName(),
                    null, receiver.getUsername(), senderWebSocketId, null,
                    ConnectionStatus.PENDING.name(),
                    ConnectionService.getCurrentDateTime(),
                    codes[selectedCodeIndex],
                    1
            );
            connectionService.saveConnection(connection);
            sendConnectionRequestMessage(connection, codes, ConnectionStatusCode.SEND_NEW_CONNECTION_REQUEST);
        } catch (Exception e) {
            log.debug(e.getMessage());
        }
    }

    private boolean isConnectionRequestAlreadySent(String senderWebSocketId) {
        return !connectionService.getConnectionsByCurrentUserWebsocketId(senderWebSocketId).stream().filter(connection ->
                Objects.equals(connection.getStatus(), ConnectionStatus.PENDING.name())
                        || Objects.equals(connection.getStatus(), ConnectionStatus.CONNECTED.name())).toList().isEmpty();
    }

    private void verifySelectedCode(WebSocketSession session, int selectedCode, String senderId) {
        try {
            String senderSessionId = usernameWebSocketIdMap.getOrDefault(senderId, null);
            if (senderSessionId == null || !sessionMap.containsKey(senderSessionId) || !sessionMap.get(senderSessionId).isOpen())
                return;   //sender is disconnected

            Optional<Connection> connectionOptional = connectionRepository.findByCurrentUserWebSocketIdAndStatus(senderSessionId, ConnectionStatus.PENDING.name());
            if (connectionOptional.isEmpty()) return;
            Connection connection = connectionOptional.get();
            connection.setAnotherUserWebSocketId(session.getId());  //set receiver websocket id
            checkConnectionCode(connection, selectedCode, session);
        } catch (Exception e) {
            log.debug(e.getMessage());
        }
    }

    private void checkConnectionCode(Connection connection, int selectedCode, WebSocketSession session) {
        try {
            if (!connection.getStatus().equals(ConnectionStatus.PENDING.name())) return;
            if (selectedCode == connection.getConnectionCode()) {
                setConnectionAfterSuccessfullyEnteredCode(connection);
                session.getAttributes().put("anotherUserId", connection.getCurrentUserId());    //receiver session put sender user id
                sessionMap.getOrDefault(connection.getCurrentUserWebSocketId(), null)
                        .getAttributes().put("anotherUserId", connection.getAnotherUserId());   //sender session put receiver user id
                // selected code wrong
            } else {
                int[] codes = ConnectionService.generateThreeRandomConnectionCode();    //generate another codes
                Random random = new Random();
                int selectedCodeIndex = random.nextInt(3);
                connection.setConnectionCode(codes[selectedCodeIndex]);
                connection.setAttempt(connection.getAttempt() + 1);
                connectionService.saveConnection(connection);
                sendConnectionRequestMessage(connection, codes, ConnectionStatusCode.RESPONSE_SELECTED_CODE_WRONG);
            }
        } catch (Exception e) {
            log.debug(e.getMessage());
        }
    }

    private void verifyToken(WebSocketSession session, String token) {
        try {
            String username = jwtService.getUsernameFromToken(token);
            if (username != null) {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                if (jwtService.validateToken(token, userDetails)) {
                    session.getAttributes().put("username", username);
                    usernameWebSocketIdMap.put(username, session.getId());
                    webSocketIdUsernameMap.put(session.getId(), username);
                    return;
                }
            }
            session.close(CloseStatus.NOT_ACCEPTABLE);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            try {
                session.close(CloseStatus.NOT_ACCEPTABLE);
            } catch (Exception ex) {
                log.debug(ex.getMessage());
            }
        }
    }

    private void getConnectionIfExist(WebSocketSession session) {
        try {
            Map<String, Object> map = new HashMap<>();
            map.put("statusCode", ConnectionStatusCode.GET_CONNECTION_IF_EXIST);
            String username = session.getAttributes().getOrDefault("username", "").toString();
            if (username.isBlank()) return;
            Connection connection = connectionRepository.findByCurrentUserWebSocketIdAndStatus(session.getId(), ConnectionStatus.CONNECTED.name())
                    .orElse(connectionRepository.findByAnotherUserWebSocketIdAndStatus(session.getId(), ConnectionStatus.CONNECTED.name()).orElse(null));
            map.put("payload", connection);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(map)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
