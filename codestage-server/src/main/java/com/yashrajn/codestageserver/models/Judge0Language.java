package com.yashrajn.codestageserver.models;

import lombok.Getter;

@Getter
public enum Judge0Language {
    C("50"),
    CPP("54"),
    JAVA("62"),
    PYTHON("71");

    private final String id;

    Judge0Language(String id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return id;
    }
}
