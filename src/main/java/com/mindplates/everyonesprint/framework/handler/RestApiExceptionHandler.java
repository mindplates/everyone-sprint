package com.mindplates.everyonesprint.framework.handler;

import com.mindplates.everyonesprint.common.exception.ServiceException;
import com.mindplates.everyonesprint.common.vo.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.validation.ConstraintViolationException;
import java.util.function.BiFunction;

@RestControllerAdvice
@Slf4j
public class RestApiExceptionHandler {

    BiFunction<HttpStatus, String, ResponseEntity<ErrorResponse>> messageResponse = (code, message) -> {
        return new ResponseEntity<ErrorResponse>(ErrorResponse.builder()
                .code(code)
                .message(message)
                .build(), HttpStatus.BAD_REQUEST);
    };
    BiFunction<HttpStatus, String, ResponseEntity<ErrorResponse>> response = (code, message) -> {
        return new ResponseEntity<ErrorResponse>(ErrorResponse.builder()
                .code(code)
                .message(message)
                .build(), code);
    };
    @Autowired
    private MessageSourceAccessor messageSourceAccessor;

    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<?> handleServiceException(ServiceException e) {
        String message = messageSourceAccessor.getMessage(e.getMessageCode(), e.getMessageParameters());
        return response.apply(e.getCode(), message);
    }


    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<?> handleServiceException(ConstraintViolationException e) {
        return messageResponse.apply(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleServiceException(RuntimeException e) {
        log.error(e.getMessage(), e);
        String message = messageSourceAccessor.getMessage("common.error.unknownError");
        return messageResponse.apply(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }
}
