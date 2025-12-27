<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark-theme.png" />
    <source media="(prefers-color-scheme: light)" srcset="assets/logo-light-theme.png" />
    <img src="assets/logo-light-theme.png" alt="CodeStage" width="80" />
  </picture>
</p>

<h1 align="center">CodeStage</h1>

<p align="center">
  Real-time collaborative coding interview platform
</p>

<p align="center">
  <a href="https://github.com/yashrajn/codestage/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  </a>
  <img src="https://img.shields.io/badge/java-21-orange.svg" alt="Java 21" />
  <img src="https://img.shields.io/badge/react-19-61dafb.svg" alt="React 19" />
  <img src="https://img.shields.io/badge/spring%20boot-4.0-6db33f.svg" alt="Spring Boot 4" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
</p>

<p align="center">
  <a href="#demo">Demo</a> ·
  <a href="#features">Features</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#development">Development</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="#contributing">Contributing</a>
</p>

<br />

## Demo

<p align="center">
  <img src="assets/demo.gif" alt="CodeStage Demo" width="800" />
</p>

> [Watch the full demo video](https://youtu.be/dcWqru1yc9w)

<br />

## Features

**For Interviewers**
- Create assessments and invite candidates via email
- Watch candidates code in real-time with live cursor tracking
- Add shared notes visible to candidates during the session
- Track candidate activity (tab switches, copy/paste events, focus changes)
- Use the built-in whiteboard for visual explanations
- End sessions and save submissions for review

**For Candidates**
- VS Code-like editing experience with Monaco Editor
- Multi-language support (JavaScript, Python, Java, C++)
- Run code with real terminal output
- Drawing canvas for sketching ideas
- Token-based secure session access

**Platform**
- WebSocket-powered real-time collaboration
- Google OAuth for admin authentication
- Automated email invitations via SMTP
- One-command Docker deployment
- Auto-generated OpenAPI documentation

<br />

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, TanStack Router/Query, Tailwind CSS, Monaco Editor, tldraw, Zustand, Radix UI |
| Backend | Java 21, Spring Boot 4.0, Spring Security, Spring WebSocket (STOMP), Flyway, Lombok |
| Database | PostgreSQL 16 |
| Code Execution | [Judge0](https://judge0.com/) (self-hosted or cloud) |
| Email | SMTP (Resend, SendGrid, or any provider) |
| Auth | Google OAuth 2.0, JWT |

<br />

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Google OAuth credentials](https://console.cloud.google.com/apis/credentials)
- [Judge0](https://github.com/judge0/judge0) instance (or use public API for development)

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/yashrajn/codestage.git
cd codestage
```

2. **Create environment file**

Create a `.env` file in the project root:

```bash
# Database
POSTGRES_DB=codestage
POSTGRES_USER=root
POSTGRES_PASSWORD=your_secure_password

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here

# Ports (optional, defaults shown)
SERVER_PORT=9000
CLIENT_PORT=9001

# URLs
CLIENT_URL=http://localhost:9001
VITE_PUBLIC_SERVER_URL=http://localhost:9000

# Google OAuth
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=your_client_id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=your_client_secret

# Email SMTP
SPRING_MAIL_HOST=smtp.resend.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=resend
SPRING_MAIL_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@yourdomain.com

# Judge0
JUDGE0_API_URL=https://ce.judge0.com
```

3. **Configure Google OAuth**

   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a project and navigate to **APIs & Services > Credentials**
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `http://localhost:9000/login/oauth2/code/google`
   - Copy credentials to your `.env` file

   See [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2/web-server) for detailed setup.

4. **Configure Judge0**

   **Development (public API):**
   ```bash
   JUDGE0_API_URL=https://ce.judge0.com
   ```
   > Note: Public API has rate limits.

   **Production (self-hosted):**
   Follow the [Judge0 installation guide](https://github.com/judge0/judge0) and update `JUDGE0_API_URL` accordingly.

5. **Start the application**

```bash
docker-compose up --build
```

6. **Access the application**

   - Frontend: http://localhost:9001
   - Backend API: http://localhost:9000
   - Swagger UI: http://localhost:9000/swagger-ui.html

<br />

## Development

### Backend (Spring Boot)

Requirements: Java 21, Maven

```bash
cd codestage-server

# Start PostgreSQL
docker run -d --name codestage-postgres \
  -e POSTGRES_DB=codestage \
  -e POSTGRES_USER=root \
  -e POSTGRES_PASSWORD=12345678 \
  -p 5432:5432 \
  postgres:16-alpine

# Run with dev profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Server runs on http://localhost:9000

### Frontend (React + Vite)

Requirements: [Bun](https://bun.sh/) (or Node.js 20+)

```bash
cd codestage-client

bun install

export VITE_PUBLIC_SERVER_URL=http://localhost:9000

bun run dev
```

Client runs on http://localhost:9001

### Testing

```bash
# Frontend
cd codestage-client
bun run test
bun run lint
bun run check

# Backend
cd codestage-server
./mvnw test
```

<br />

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CODESTAGE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐              ┌────────────────┐                 │
│  │  React Client  │   HTTP/WS    │ Spring Boot API│                 │
│  │  (Port 9001)   │◄────────────►│  (Port 9000)   │                 │
│  │                │              │                │                 │
│  │  Monaco Editor │              │  REST API      │                 │
│  │  TanStack      │              │  WebSocket     │                 │
│  │  tldraw        │              │  OAuth2 + JWT  │                 │
│  └────────────────┘              └───────┬────────┘                 │
│                                          │                          │
│                       ┌──────────────────┼──────────────────┐       │
│                       ▼                  ▼                  ▼       │
│                ┌────────────┐     ┌────────────┐     ┌──────────┐   │
│                │ PostgreSQL │     │  Judge0    │     │   SMTP   │   │
│                └────────────┘     └────────────┘     └──────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
codestage/
├── codestage-client/           # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── lib/                # Utilities and API client
│   │   ├── routes/             # TanStack Router pages
│   │   └── stores/             # Zustand state
│   ├── Dockerfile
│   └── package.json
│
├── codestage-server/           # Spring Boot backend
│   ├── src/main/java/.../
│   │   ├── auth/               # JWT and OAuth2
│   │   ├── config/             # Spring configuration
│   │   ├── controllers/        # REST and WebSocket
│   │   ├── models/             # Entities and DTOs
│   │   ├── repository/         # JPA repositories
│   │   └── services/           # Business logic
│   ├── src/main/resources/
│   │   ├── db/migration/       # Flyway migrations
│   │   └── templates/          # Email templates
│   ├── Dockerfile
│   └── pom.xml
│
├── docker-compose.yml
└── README.md
```

<br />

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/assessment` | Create new assessment |
| `GET` | `/assessment` | List all assessments |
| `GET` | `/assessment/join/{sessionId}` | Generate join token |
| `GET` | `/assessment/check-token` | Validate candidate token |
| `GET` | `/assessment/replay/{sessionId}` | Get session replay |
| `GET` | `/admin/me` | Get current admin info |

### WebSocket Destinations

| Destination | Direction | Description |
|-------------|-----------|-------------|
| `/app/{sessionId}/code-change` | Client → Server | Code updates |
| `/app/{sessionId}/language-switch` | Client → Server | Language change |
| `/app/{sessionId}/caret-move` | Client → Server | Cursor position |
| `/app/{sessionId}/mouse` | Client → Server | Mouse tracking |
| `/app/{sessionId}/notes` | Admin → Server | Update notes |
| `/app/{sessionId}/events` | Client → Server | Activity events |
| `/app/{sessionId}/execute-code` | Client → Server | Run code |
| `/app/{sessionId}/end-session` | Admin → Server | End assessment |
| `/app/{sessionId}/draw-diff` | Client → Server | Drawing updates |

Full API documentation available at `/swagger-ui.html` when running locally.

<br />

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_DB` | Yes | Database name |
| `POSTGRES_USER` | Yes | Database username |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `CLIENT_URL` | Yes | Frontend URL for CORS |
| `VITE_PUBLIC_SERVER_URL` | Yes | Backend URL for frontend |
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `SPRING_MAIL_HOST` | Yes | SMTP server host |
| `SPRING_MAIL_PORT` | Yes | SMTP server port |
| `SPRING_MAIL_USERNAME` | Yes | SMTP username |
| `SPRING_MAIL_PASSWORD` | Yes | SMTP password |
| `EMAIL_FROM` | Yes | Sender email address |
| `JUDGE0_API_URL` | Yes | Judge0 API endpoint |
| `SERVER_PORT` | No | Backend port (default: 9000) |
| `CLIENT_PORT` | No | Frontend port (default: 9001) |

### Supported Languages

| Language | File Extension |
|----------|----------------|
| JavaScript | `.js` |
| Python 3 | `.py` |
| Java | `.java` |
| C++ | `.cpp` |

<br />

## Deployment

### Production with Docker Compose

1. Update `.env` with production values
2. Build and run:

```bash
docker-compose up -d --build
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:9001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://localhost:9000/;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }

    location /ws {
        proxy_pass http://localhost:9000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

<br />

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### Guidelines

- Frontend: Follow [Biome](https://biomejs.dev/) linting rules
- Backend: Follow Java conventions with Lombok annotations
- Write clear, descriptive commit messages
- Include tests for new features

<br />

## Known Limitations

- Best experience on Chrome, Firefox, and Edge
- Stable internet connection required for real-time features
- Judge0 public API has rate limits (self-host for production)
- Currently supports 4 programming languages

<br />

## Roadmap

- [ ] Additional language support (Go, Rust, TypeScript)
- [ ] AI-powered code analysis
- [ ] Custom assessment templates
- [ ] Team/organization management
- [ ] Analytics dashboard

<br />

## License

MIT License. See [LICENSE](LICENSE) for details.

<br />

## Acknowledgments

- [Judge0](https://judge0.com/) — Code execution engine
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — Code editor
- [tldraw](https://tldraw.dev/) — Drawing canvas
- [TanStack](https://tanstack.com/) — React Router and Query
- [Radix UI](https://www.radix-ui.com/) — Accessible components
- [Tailwind CSS](https://tailwindcss.com/) — Styling
