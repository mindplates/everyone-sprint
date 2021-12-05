package com.mindplates.everyonesprint.common.code;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum RoleCode {

	SUPER_MAN("ROOT"),
	ADMIN("ADMIN"),
	MEMBER("MEMBER");
	private String code;

}
