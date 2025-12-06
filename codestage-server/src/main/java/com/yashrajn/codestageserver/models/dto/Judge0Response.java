package com.yashrajn.codestageserver.models.dto;

import lombok.Data;

@Data
public class Judge0Response {
    private String stdout;
    private String time;
    private Integer memory;
    private String stderr;
    private String token;
}
