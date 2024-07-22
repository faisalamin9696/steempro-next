This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

add these enviorement variables

```AUTH_SECRET="SECRET_KEY_HERE"
AUTH_TRUST_HOST = "http://localhost:3000/api/auth/session"
NEXT_PUBLIC_SECURE_LOCAL_STORAGE_DISABLED_KEYS=UserAgent|ScreenPrint|Plugins|Fonts|LocalStorage|SessionStorage|TimeZone|Language|SystemLanguage|Cookie|Canvas|Hostname
NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY="SECRET_KEY_HERE"
FIREBASE_API_KEY="SECRET_KEY_HERE"
MYSQL_DB_HOST = "DB_HOST_HERE"
MYSQL_DB_PORT = DB_PORT_HERE
MYSQL_DB_USERNAME = "DB_USERNAME_HERE"
MYSQL_DB_PASSWORD = "DB_PASSWORD_HERE"
MYSQL_DB_DATABASE="DB_DATABASE_NAME_HERE" # for post scheduling
MYSQL_DB_DATABASE_2="SECOND_DATABASE_NAME_HERE" # for post views, promotion, and announcement
MYSQL_SSH_HOST = "SSH_HOST_HERE"
MYSQL_SSH_PORT = SSH_POST_HERE
MYSQL_SSH_USERNAME = "SSH_USERNAME_HERE"
MYSQL_SSH_PASSWORD = "SSH_PASSWORD_HERE"
MYSQL_SCHEDULES_TABLE = "SCHEDULE_TABLE_HERE"
MYSQL_PROMOTIONS_TABLE = "PROMOTIONS_TABLE_HERE"
MYSQL_ANNOUNCEMENTS_TABLE = "ANNOUNCEMENTS_TABLE_HERE"
MYSQL_VIEWS_TABLE = "VIEWS_TABLE_HERE"
NEXT_PUBLIC_SUPABASE_URL= SUPABASE_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY= SUPABASE_ANON_KEY_HERE
NEXT_PUBLIC_ALLOWED_ORIGINS=["localhost:3000" "https://www.steempro.com", "https:steempro.com","steempro.com","www.steempro.com","steempro-next.vercel.app"]

```

other firebase configurations in 

```src\libs\firebase\firebase.config.ts```

For MySQL database configuration create databases, tables for post scheduling, views, promotion and annoucements

## Scheduling database

```bash
CREATE DATABASE `database_name` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
```

### Scheduling database table

```bash
CREATE TABLE `table_name` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `title` text NOT NULL,
  `body` longtext NOT NULL,
  `tags` longtext NOT NULL,
  `parent_permlink` varchar(45) NOT NULL,
  `options` longtext NOT NULL,
  `time` char(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `status` int NOT NULL,
  `permlink` text,
  `message` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

```

### Views, Promotion and Announcements Database

```bash
CREATE DATABASE `database_name` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
```

### Announcement table

```bash
CREATE TABLE `table_name` (
  `id` int NOT NULL AUTO_INCREMENT,
  `authPerm` text NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Promotions table

```bash
CREATE TABLE `table_name` (
  `id` int NOT NULL AUTO_INCREMENT,
  `authPerm` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

```

### Views table

```bash
CREATE TABLE `views` (
  `id` int NOT NULL AUTO_INCREMENT,
  `authPerm` text NOT NULL,
  `uid` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_authPerm_uid` (`authPerm`(300),`uid`),
  KEY `authperm_index` (`authPerm`(300))
) ENGINE=InnoDB AUTO_INCREMENT=3832 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
