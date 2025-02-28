package com.learn.java.filetransfer.exception;

public class AlreadyConnectionRequestedException extends RuntimeException {
    public AlreadyConnectionRequestedException(String message) {
        super(message);
    }
}
