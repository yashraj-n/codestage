package com.yashrajn.codestageserver.models.dto;

import com.yashrajn.codestageserver.models.Judge0Language;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Judge0Request {
    private Judge0Language language_id;
    private String source_code;
    private String stdin;
}
