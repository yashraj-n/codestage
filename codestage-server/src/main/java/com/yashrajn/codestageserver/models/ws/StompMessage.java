package com.yashrajn.codestageserver.models.ws;

import lombok.Data;

@Data
public class StompMessage<T> {
    private T data;
    private StompMessageType type;
    private String sessionId;
}
