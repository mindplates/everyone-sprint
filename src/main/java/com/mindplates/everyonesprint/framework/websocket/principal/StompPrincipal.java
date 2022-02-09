package com.mindplates.everyonesprint.framework.websocket.principal;

import java.security.Principal;

public class StompPrincipal implements Principal {

    private String name;

    public StompPrincipal(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }

}
