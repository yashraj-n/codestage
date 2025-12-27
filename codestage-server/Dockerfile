FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
COPY src src

RUN chmod +x mvnw
RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S codestage && adduser -S codestage -G codestage
USER codestage

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
