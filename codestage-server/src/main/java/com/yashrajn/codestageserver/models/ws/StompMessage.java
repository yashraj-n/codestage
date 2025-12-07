package com.yashrajn.codestageserver.models.ws;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StompMessage<T> {
    private T data;
    private StompMessageType type;
    private String sessionId;
}
