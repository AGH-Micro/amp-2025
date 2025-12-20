# amp_srvtest Project (C)

This project is a simple TCP server written in **C** using the **Winsock** library for Windows. The server listens on port 5000, accepts a connection from a single client, and then echoes all received data back to it.

## Running the Project

To compile and run the project locally, follow the steps below.

### 1. Cloning the Repository (First Time Only)

```bash
git clone <gitlab-repository-url>
cd amp_srvtest
```

### 2. Compiling the Code

Make sure you have a C compiler for Windows installed, e.g., **MinGW-w64 (GCC)**. Then, in the main project directory, run the command to compile the `main.c` file:

```bash
gcc main.c -o server.exe -lws2_32
```

This command will compile the source code and create an executable file `server.exe`, linking it with the Winsock library (`ws2_32`).

### 3. Running the Server

To run the application, use the command:

```bash
.\server.exe
```

The server will start listening on port 5000 and wait for a connection from a client.
