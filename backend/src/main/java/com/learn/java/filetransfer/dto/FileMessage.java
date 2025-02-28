package com.learn.java.filetransfer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class FileMessage {
   private String name; ///name of the sender or receiver
   private String senderId;
   private String receiverId;
   private Integer statusCode;
   private Object content;
   private String date;
}


