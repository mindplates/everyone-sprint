#!/bin/sh

nohup java -jar -Djava.net.preferIPv4Stack=true -Dname=everyone-sprint -Dspring.profiles.active=default,production -Dspring.config.additional-location=./conf/application.properties -Dlog.dir=./logs  ./bin/__fileName__.war
