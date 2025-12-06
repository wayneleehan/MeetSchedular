# 步驟 1: 建置 (Build Stage)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# 跳過測試以加速部署 (mvn clean package -DskipTests)
RUN mvn clean package -DskipTests

# 步驟 2: 執行 (Run Stage)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# 從上一步驟複製打包好的 jar 檔
COPY --from=build /app/target/*.jar app.jar
# 開放 8080 Port
EXPOSE 8080
# 啟動指令
ENTRYPOINT ["java", "-jar", "app.jar"]