package com.learn.java.filetransfer.status;

public class ConnectionStatusCode {
    public static final int SEND_NEW_CONNECTION_REQUEST = 204;
    public static final int DECLINE_CONNECTION_REQUEST = 142;
    public static final int RECEIVE_NEW_CONNECTION_REQUEST = 264;
    public static final int VERIFY_SELECTED_CODE = 382;
    public static final int REQUEST_FOR_RECEIVE_FILE = 422;
    public static final int ACCEPT_TO_RECEIVE_FILE = 388;
    public static final int DECLINE_TO_RECEIVE_FILE = 444;
    public static final int REQUEST_FOR_DISCONNECTING_CONNECTION = 508;
    public static final int RESPONSE_SELECTED_CODE_WRONG = 406;
    public static final int RESPONSE_SELECTED_CODE_CORRECT = 200;
    public static final int RESPONSE_SENDER_DISCONNECTED = 404;
    public static final int DISCONNECTED_CONNECTION = 504;
    public static final int CONNECTED_CONNECTION = 202;
    public static final int CONNECTION_REQUEST_ALREADY_SENT = 409;
    public static final int SEND_ALL_CONNECTIONS_REQUEST = 340;
    public static final int REQUEST_TO_SEND_ALL_CONNECTIONS_REQUEST = 447;
    public static final int SEND_ID = 243;
    public static final int SEND_TOKEN_FOR_VERIFYING = 234;
    public static final int SEND_FILE = 252;
    public static final int FILE_SENT = 263;
    public static final int CANCEL_SEND_FILE = 384;
    public static final int FILE_RECEIVED = 267;
    public static final int GET_CONNECTION_IF_EXIST = 417;
    public static final int SEARCH_USER = 378;
    public static final int SEARCH_USER_RESULT = 389;
    public static final int GET_USER_BY_USERNAME = 356;
    public static final int WEBRTC = 374;
}


//statusCode for
//    sending new connection request is 204
//    decline connection request is 142
//    sending selected code correct or not for a request is 382
//    wrong selected code response is 406
//    correct selected code response is 200
//    sender disconnected when verifying code is 404
//    disconnecting code for connection is 504
//    connected connection is 202