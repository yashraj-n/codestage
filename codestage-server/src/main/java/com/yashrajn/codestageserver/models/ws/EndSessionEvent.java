package com.yashrajn.codestageserver.models.ws;

import lombok.Data;

@Data
public class EndSessionEvent {
    private String code;
    private String notes;
}
