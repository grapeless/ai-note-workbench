package com.lim.noteworkbench.common.response;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ResultCode {
    SUCCESS(0, HttpStatus.OK, "ok"),
    PARAMS_ERROR(40000, HttpStatus.BAD_REQUEST, "参数错误"),
    NOT_LOGIN_ERROR(40100, HttpStatus.UNAUTHORIZED, "未登录"),
    NO_AUTH_ERROR(40301, HttpStatus.FORBIDDEN, "无权限"),
    FORBIDDEN_ERROR(40300, HttpStatus.FORBIDDEN, "禁止访问"),
    NOT_FOUND_ERROR(40400, HttpStatus.NOT_FOUND, "请求数据不存在"),
    METHOD_NOT_ALLOWED_ERROR(40500, HttpStatus.METHOD_NOT_ALLOWED, "请求方式不支持"),
    SYSTEM_ERROR(50000, HttpStatus.INTERNAL_SERVER_ERROR, "系统错误"),
    OPERATION_ERROR(50001, HttpStatus.INTERNAL_SERVER_ERROR, "操作失败");

    private final int code;

    private final HttpStatus httpStatus;

    private final String message;

    ResultCode(int code, HttpStatus httpStatus, String message) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
