package com.lim.noteworkbench.common.response;

import java.io.Serializable;

public record Result<T>(
        int code,
        T data,
        String message
) implements Serializable {

    //即使是null也可以被任意类型的类持有，结合泛型就需要提供T以声明该类的类型，
    //但我们这里实际上需要表示类的类型也为空，所以用一个无语义类型Void来占位T。
    //Void null：表示一个Void类型的类，值为空（null）。
    //这样在该字段的类的类型和值上都表示了不属于任何，又完成了对泛型字段的占位。
    //为什么不用 Result<Object>？因为 Object 能表示有“任意类型的数据”，只是值为空，语义不够明确；Void 更准确地表达“不会有返回数据”
    public static Result<Void> success() {
        return new Result<>(ResultCode.SUCCESS.getCode(), null, ResultCode.SUCCESS.getMessage());
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(ResultCode.SUCCESS.getCode(), data, ResultCode.SUCCESS.getMessage());
    }

    public static <T> Result<T> success(T data, String message) {
        return new Result<>(ResultCode.SUCCESS.getCode(), data, message);
    }

    public static <T> Result<T> error(ResultCode resultCode) {
        return new Result<>(resultCode.getCode(), null, resultCode.getMessage());
    }

    public static <T> Result<T> error(ResultCode resultCode, String message) {
        return new Result<>(resultCode.getCode(), null, message);
    }
}