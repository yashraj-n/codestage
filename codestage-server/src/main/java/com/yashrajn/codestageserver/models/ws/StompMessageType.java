package com.yashrajn.codestageserver.models.ws;

import lombok.Getter;

@Getter
public enum StompMessageType {
    JOIN("JOIN"),
    LEAVE("LEAVE"),
    MOUSE_MOVE("MOUSE_MOVE"),
    NOTES("NOTES");

    private final String type;

    StompMessageType(String type) {
        this.type = type;
    }

}
