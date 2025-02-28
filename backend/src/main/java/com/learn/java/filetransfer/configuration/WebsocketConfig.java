package com.learn.java.filetransfer.configuration;


import com.learn.java.filetransfer.websocket.FileTransferWebsocket;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebsocketConfig implements WebSocketConfigurer {

    private final FileTransferWebsocket fileTransferWebsocket;


    public WebsocketConfig(FileTransferWebsocket fileTransferWebsocket) {
        this.fileTransferWebsocket = fileTransferWebsocket;
    }


    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(fileTransferWebsocket, "/transfer")
                .setAllowedOrigins("https://file-transfer-delta.vercel.app/", "http://localhost:5173");
    }


}
