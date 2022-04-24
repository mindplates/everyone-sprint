package com.mindplates.everyonesprint.framework.websocket.principal;

import lombok.AllArgsConstructor;

import java.security.Principal;

@AllArgsConstructor
public class StompPrincipal implements Principal {

    final private String name;
    
    @Override
    public String getName() {
        return name;
    }

}
