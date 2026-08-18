# 构建阶段
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# 先复制项目描述，再复制源码
COPY pom.xml .
COPY src ./src

RUN mvn --batch-mode -DskipTests package

# 运行阶段
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/note-workbench-*.jar app.jar

# 提前创建后端需要写入的目录，并使用非 root 用户运行应用。
RUN mkdir -p storage logs && chown -R 10001:10001 /app

USER 10001:10001

# 仅声明容器监听端口；是否对宿主机开放由 Docker Compose 决定。
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
