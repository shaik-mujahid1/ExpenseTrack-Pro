# Stage 1: Build application with Maven and Java 21
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime image with Eclipse Temurin JRE 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Run as non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser && mkdir -p /app/data && chown -R appuser:appgroup /app
USER appuser

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Render injects PORT dynamically (default 8080)
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
