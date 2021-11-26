package com.mindplates.everyonesprint.common.exception;

import lombok.Getter;

@Getter
public class ServiceException extends CommonException{

	private String code;
	private String messageCode;
	private String[] messageParameters;

	public ServiceException(String code ) {
		this.code = code;
	}

	public ServiceException(String code, String messageCode ) {
		this.code = code;
		this.messageCode = messageCode;
	}

	public ServiceException(String code, String messageCode, String[] messageParameters) {
		this.code = code;
		this.messageCode = messageCode;
		this.messageParameters = messageParameters;
	}
}
