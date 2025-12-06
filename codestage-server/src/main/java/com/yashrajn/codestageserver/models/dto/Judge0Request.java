package com.yashrajn.codestageserver.models.dto;

import com.yashrajn.codestageserver.models.Judge0Language;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Judge0Request {
    private Judge0Language language_id;
    private String source_code;
    private String stdin;
}
