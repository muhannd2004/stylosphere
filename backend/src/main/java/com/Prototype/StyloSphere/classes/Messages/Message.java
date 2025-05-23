package com.Prototype.StyloSphere.classes.Messages;

import jakarta.persistence.*;

import java.time.LocalDateTime;
@Entity
@Table(name = "Messages")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.STRING)
public abstract class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;
    private Long senderId;
    private LocalDateTime timeStamp;

    public Message(String message, Long senderId) {
        this.message = message;
        this.senderId = senderId;
        this.timeStamp = LocalDateTime.now();
    }
    public Message() {
    }

    public Long getId() {
        return this.id;
    }
    public String getType()
    {
        return this.getClass().getSimpleName();
    }

    public LocalDateTime getTimeStamp() {
        return this.timeStamp;
    }
    public void setTimeStamp(LocalDateTime timeStamp) {
        this.timeStamp = timeStamp;
    }

    public String getMessage() {
        return this.message;
    }

    public Long getSender() {
        return this.senderId;
    }
    public void setSender(Long sender) {
        this.senderId = sender;
    }
}
