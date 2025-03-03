FROM maven:3.9.8-sapmachine-22 AS build
WORKDIR /home/app
COPY pom.xml ./
COPY src ./src
RUN mvn clean package -DskipTests


FROM openjdk:21
WORKDIR /home/app
# Copy the pom.xml file and the .m2 cache (if any) to build the dependencies first
#COPY pom.xml ./
#COPY mvnw ./
#COPY .mvn .mvn
#RUN chmod +x ./mvnw
#RUN ./mvnw dependency:go-offline
COPY --from=build /home/app/target/fileTransfer-0.0.1-SNAPSHOT.jar file-transfer.jar
EXPOSE 8080
ENTRYPOINT [ "java","-jar","/home/app/file-transfer.jar" ]
#COPY . .
#RUN ./mvnw clean package -DskipTests
#CMD ["java","-jar","/home/app/target/fileTransfer-0.0.1-SNAPSHOT.jar"]

