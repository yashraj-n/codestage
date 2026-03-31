package com.yashrajn.codestageserver.models.entity;

public enum WorkspaceEventType {
    TAB_SWITCH, PASTE,
    COPY, FOCUS_LOST,
    FOCUS_GAINED, SESSION_START,
    SESSION_END, CODE_RUN,
    CODE_CHANGE, EXECUTE_CODE,
    GAZE_AWAY
}
