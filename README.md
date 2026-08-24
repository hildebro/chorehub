# Laneh

###### /lä-neh/ (*Farsi*: لانه); Nest, den, home.

Self-hosted app to manage shopping, expenses and (recurring) tasks. Can be used on your own, but really shines in a
shared household with multiple users.

## Getting started with Docker

### Installation

- Create a folder for the project
- Download [docker-compose.prod.yml](docker-compose.prod.yml) into the folder
- Rename the file to `docker-compose.yml`
- Download [.env.example](.env.example) into the folder
- Rename the file to `.env`
- Feel free to adjust the timezone in `.env` to fit your location. The remaining values can be kept as-is without any
  issues.
- Create an empty folder called `pqlite-data` (must match `DATABASE_LOCATION` value from .env)
- run `docker compose up -d`
- Access the app via http://localhost:3000

### Updating

- The app menu will show you, if there's a new version available
- Navigate to your Laneh folder
- Run `docker compose pull && docker compose up -d`

### Run at startup

If you want to automatically start the container whenever your server starts, I suggest using this systemd unit. Make
sure to replace `/path/to/laneh` and `myusername` with the correct values for your setup.

```unit file (systemd)
[Unit]
Description=Laneh Docker Compose
After=docker.service network.target
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/path/to/laneh
User=myusername
Group=myusername
ExecStart=/usr/bin/docker-compose up
ExecStop=/usr/bin/docker-compose down
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

## Android

There is no publicly available prebuilt android version yet. I will add a link to the Play Store here, when it's ready.

In the meantime, you can follow the steps in [Android (static)](#android-static) to build your own APK.

## Development

If you want to create a pull request, run `git config core.hooksPath .githooks` before you start to ensure your commit
messages are clean.

### Web

- Clone this repository.
- Copy `.env.exmaple` to `.env`
- Start the container via `docker compose up`
- Access the app via http://localhost:5173

### Android (static)

- Requires `npm` and an Android development environment
- Connect your phone to the PC
- Follow the [Web](#web) steps
- Run `CAPACITOR_BUILD=true npm run build`
- Run `npx cap sync android`
- Run `npx cap run android`

### Android (hot-reload)

Roughly the same steps as for the static version, but with some adjustments:

- You technically don't need the `npm run build` step, because the hot-reload version of the app won't use the `build`
  folder as its source. But the Capacitor commands will still fail, if it can't find `build/index.hmtl`. So if you skip
  the build, you need to at least create an empty file at that location.
- Run `npm run dev -- --host --port 3000`
    - This needs to run separately to your already running docker container on port 5173
- Add `CAP_LIVE_RELOAD=true CAP_SERVER_URL=http://%HOST_IP%:3000` before the `npx cap run android` command
