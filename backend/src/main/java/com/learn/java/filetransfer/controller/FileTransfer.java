package com.learn.java.filetransfer.controller;


import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;

@RestController
@RequestMapping("/file-transfer")
public class FileTransfer {

    private final Path rootLocation = Paths.get("./src/main/resources/files");

    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("files") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return new ResponseEntity<>("Please select a file to upload", HttpStatus.BAD_REQUEST);
            }
            // Create the directory if it doesn't exist
            Files.createDirectories(rootLocation);

            // Save the file to the server
            Path destinationFile = rootLocation.resolve(Paths.get(Objects.requireNonNull(file.getOriginalFilename()))).normalize().toAbsolutePath();
            file.transferTo(destinationFile);

            return new ResponseEntity<>("File uploaded successfully", HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>("Failed to upload file", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> handleFileDownload(@RequestParam("filename") String filename) {
        try {
            Path file = rootLocation.resolve(filename).normalize().toAbsolutePath();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (MalformedURLException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
