package com.lim.noteworkbench.common.exception;

import com.lim.noteworkbench.common.response.Result;
import com.lim.noteworkbench.common.response.ResultCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Objects;


/**
 * <p>全局异常处理器负责把捕获的异常转换成统一 HTTP 响应。</p>
 *
 * <p>不同层面负责捕获到处理器内的异常类的类别：</p>
 * <ol>
 *     <li>请求参数无法绑定                         → Spring MVC 框架。</li>
 *     <li>输入格式不合法                           → Bean Validation 。</li>
 *     <li>依赖数据库的业务规则、程序或基础设施错误等 → Service 里。</li>
 * </ol>
 *
 * <p>异常抛出原则：</p>
 * <ol>
 *     <li>业务异常尽量统一为BusinessException抛出，同时返回明确的业务错误码和提示便于前端处理。</li>
 *     <li>业务代码不要直接返回 Result.error(...)，避免响应体错误码与HTTP状态不一致，
 *     需要通过ResultCode同时定义业务码和HTTP状态，在异常处理器里转为ResponseEntity返回。</li>
 *     <li>常见框架异常由框架抛出，在全局异常处理器里按需单独捕获，例如参数校验、类型转换、JSON 解析失败等。</li>
 *     <li>内部编程异常原样抛出，例如IllegalArgumentException、NullPointerException，让它们进入兜底。
 *     用Exception兜底必须记录完整堆栈便于自己调试，但对前端只返回通用系统错误，避免泄露内部信息。</li>
 * </ol>
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理请求绑定、类型转换和消息读取异常
     */
    @ExceptionHandler({
            ServletRequestBindingException.class,
            MissingServletRequestPartException.class,
            MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<Result<Void>> handleRequestInputException() {
        return errorResponse(ResultCode.PARAMS_ERROR, ResultCode.PARAMS_ERROR.getMessage());
    }

    /**
     * 处理请求方式不支持异常
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Result<Void>> handleMethodNotAllowedException() {
        return errorResponse(
                ResultCode.METHOD_NOT_ALLOWED_ERROR,
                ResultCode.METHOD_NOT_ALLOWED_ERROR.getMessage()
        );
    }

    /**
     * 处理请求路径不存在异常
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Result<Void>> handleNoResourceFoundException() {
        return errorResponse(ResultCode.NOT_FOUND_ERROR, "请求地址不存在");
    }

    /**
     * 处理 @Valid 请求参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<Void>> handleValidationException(MethodArgumentNotValidException exception) {
        FieldError fieldError = exception
                .getBindingResult()
                .getFieldError();

        String message = fieldError == null
                ? ResultCode.PARAMS_ERROR.getMessage()
                : fieldError.getDefaultMessage();

        return errorResponse(ResultCode.PARAMS_ERROR, message);
    }

    /**
     * 处理 Controller 方法参数校验异常
     */
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<Result<Void>> handleMethodValidationException(HandlerMethodValidationException exception) {
        String message = exception.getAllErrors().stream()
                .map(MessageSourceResolvable::getDefaultMessage)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(ResultCode.PARAMS_ERROR.getMessage());

        return errorResponse(ResultCode.PARAMS_ERROR, message);
    }

    /**
     * 处理自定义业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Result<Void>> handleBusinessException(BusinessException exception) {
        return errorResponse(exception.getResultCode(), exception.getMessage());
    }

    /**
     * 处理其他未知异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Void>> handleException(Exception exception) {
        log.error("系统异常", exception);

        return errorResponse(ResultCode.SYSTEM_ERROR, ResultCode.SYSTEM_ERROR.getMessage());
    }

    private ResponseEntity<Result<Void>> errorResponse(ResultCode resultCode, String message) {
        return ResponseEntity
                .status(resultCode.getHttpStatus())
                .body(Result.error(resultCode, message));
    }
}
