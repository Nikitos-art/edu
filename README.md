# Tutor Platform Web Application

## Overview

This project is a full-stack web application designed to connect students with tutors, similar in concept to platforms like Preply. It evolved into a large-scale personal project that combines learning tools, real-time communication, scheduling, and interactive features.

Beyond its original purpose, the project became a sandbox for exploring full-stack development, real-time systems, deployment, and applied problem-solving.

---

## Key Features

### User System

* Two user roles: **Students** and **Tutors**
* Authentication (login/logout)
* Profile management with **profile pictures (media handling)**
* Separate dashboards for each user type

### Tutor–Student Interaction

* Real-time **chat system** (Django Signals + Redis)
* **Booking system** with calendar integration:

  * Students can schedule lessons with tutors
  * Tutors can view and manage their schedule

### Quiz Application

* Tutors can create quizzes
* Students (or any user) can take quizzes
* Focus on interaction rather than persistent scoring

### Blog System

* Standard blog functionality for content sharing

---

## Interactive Features (Highlight)

### Crossword Generator (JavaScript)

* Dynamically generates crossword puzzles using random words
* Handles:

  * Word alignment
  * Length constraints
  * Overlapping logic
* One of the most technically challenging parts of the project

### Chess Game

* **Single-player mode**:

  * AI trained using PyTorch (~ELO 500)
* **Multiplayer mode**:

  * Real-time gameplay using Django Signals
* Demonstrates:

  * Basic AI integration
  * Real-time networking concepts

### Chinese Word Guessing Game

* Uses **microphone input**
* Adds an experimental, interactive learning component

### Online Python Code Runner (Experimental)

* Execute Python code directly in the browser
* Not deployed publicly due to security concerns

---

## Tech Stack

### Backend

* Django
* Django Channels (via Daphne)
* Redis (chat + real-time features)
* Gunicorn

### Frontend

* HTML, CSS (responsive design)
* JavaScript
* Some UI/animation components adapted from external sources

### Infrastructure & Deployment

* Nginx (reverse proxy)
* DigitalOcean (hosting)
* Cloudflare (DNS + protection)
* Docker (separate dev & production environments)

### AI / Data

* PyTorch (chess AI)

---

## Deployment Experience

The project was deployed in production for several months and included:

* Domain setup and DNS configuration
* Nginx server configuration
* SSL setup
* Bot mitigation using:

  * Rate limiting
  * Cloudflare protection
* Handling large volumes of malicious traffic

This phase provided hands-on experience with real-world issues like abuse prevention and server stability.

---

## Challenges & Learnings

* Building and debugging **real-time systems** (chat, multiplayer)
* Designing a **crossword generation algorithm**
* Managing **state and synchronization** across users
* Deploying a full-stack app under **constant bot traffic**
* Structuring a project of significant size without losing control
* Working with tools like Docker, Nginx, and Redis in production

---

## Notes on Code & Credits

This project is primarily my own work, but:

* I used external resources for some **frontend animations and UI ideas**
* I occasionally relied on **ChatGPT for guidance and debugging**

I do not claim full mastery of every component, but I understand the majority of the system and how the pieces interact.

---

## Current Status

* Not publicly deployed
* Not open-sourced (mainly due to:

  * PyTorch size
  * Security concerns, especially around code execution features)

---

## Future Improvements (Optional)

* Secure sandboxing for code execution
* Persistent quiz results
* Course system (initially planned but not implemented)
* Improved AI for chess

---

## Why This Project Matters

This is my largest and most complete project to date. It reflects:

* Growth in full-stack development
* Exposure to real production environments
* Ability to build and maintain a complex system end-to-end

---


### Local launch
1. poetry shell
2. make up
3. 127.0.0.1:8000
4. make down
