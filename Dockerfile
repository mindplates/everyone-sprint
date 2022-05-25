FROM openjdk:8-jdk-alpine

ENV SPRING_PROFILE=default,development

EXPOSE 8080

ADD build/libs/everyone-sprint-0.5.0-SNAPSHOT.war everyone-sprint-0.5.0-SNAPSHOT.war

ENTRYPOINT ["java", "-jar","everyone-sprint-0.5.0-SNAPSHOT.war"]
