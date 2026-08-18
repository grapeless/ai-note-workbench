FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# 依赖与源码分层：pom.xml 不变时，业务代码修改可以复用 Maven 依赖层。
COPY pom.xml .
RUN mvn --batch-mode --no-transfer-progress -DskipTests dependency:go-offline

COPY src ./src
RUN mvn --batch-mode --no-transfer-progress -DskipTests package && \
    cp target/note-workbench-*.jar application.jar && \
    java -Djarmode=tools -jar application.jar extract --layers --destination extracted

FROM eclipse-temurin:21-jre

WORKDIR /app

# 基础镜像已包含健康检查需要的 curl；先创建可写目录，避免复制 JAR 后再递归 chown 产生重复镜像层。
RUN mkdir -p storage logs && chown 10001:10001 storage logs

# Spring Boot 分层 JAR：依赖层稳定，通常只有最后的应用代码层会随源码变化。
COPY --chown=10001:10001 --from=build /app/extracted/dependencies/ ./
COPY --chown=10001:10001 --from=build /app/extracted/spring-boot-loader/ ./
COPY --chown=10001:10001 --from=build /app/extracted/snapshot-dependencies/ ./
COPY --chown=10001:10001 --from=build /app/extracted/application/ ./

USER 10001:10001

# 仅声明容器监听端口；是否对宿主机开放由 Docker Compose 决定。
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "application.jar"]
