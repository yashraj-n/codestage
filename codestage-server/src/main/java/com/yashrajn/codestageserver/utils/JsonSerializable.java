package com.yashrajn.codestageserver.utils;

import com.google.gson.Gson;

public interface JsonSerializable {
    default String toJson() { return new Gson().toJson(this); }
    static <T> T fromJson(String json, Class<T> type) {
        return new Gson().fromJson(json, type);
    }
}
