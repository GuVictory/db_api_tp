CREATE DATABASE forum_api_tp OWNER root;

DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Forums CASCADE;
DROP TABLE IF EXISTS Threads CASCADE;
DROP TABLE IF EXISTS Votes;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS forum_users;

create extension if not exists CITEXT;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  about TEXT DEFAULT NULL,
  fullname TEXT DEFAULT NULL,
  nickname CITEXT COLLATE "ucs_basic" UNIQUE,
  email CITEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS forums (
  id SERIAL PRIMARY KEY,
  posts INTEGER DEFAULT 0,
  slug CITEXT COLLATE "ucs_basic" UNIQUE,
  threads INTEGER DEFAULT 0,
  title TEXT NOT NULL,
  nickname CITEXT COLLATE "ucs_basic" REFERENCES "users"(nickname) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS threads (
	author CITEXT COLLATE "ucs_basic" REFERENCES "users"(nickname) ON DELETE CASCADE,
	created TIMESTAMPTZ,
	forum CITEXT COLLATE "ucs_basic" REFERENCES "forums"(slug) ON DELETE CASCADE,
	id SERIAL PRIMARY KEY,
	message TEXT DEFAULT '',
	slug CITEXT COLLATE "ucs_basic" UNIQUE,
	title TEXT NOT NULL,
	votes INTEGER DEFAULT 0
);


CREATE TABLE IF NOT EXISTS posts (
  author CITEXT COLLATE "ucs_basic" REFERENCES "users"(nickname) ON DELETE CASCADE,
  created TIMESTAMPTZ,
  forum CITEXT COLLATE "ucs_basic" REFERENCES "forums"(slug) ON DELETE CASCADE,
  id SERIAL PRIMARY KEY,
  isEdited BOOLEAN DEFAULT FALSE,
  message TEXT DEFAULT '',
  parent INTEGER NOT NULL DEFAULT 0,
  path INTEGER [],
  thread INTEGER NOT NULL REFERENCES "threads"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS votes (
  nickname CITEXT COLLATE "ucs_basic" REFERENCES  "users"(nickname) ON DELETE CASCADE,
  thread INTEGER NOT NULL REFERENCES "threads"(id) ON DELETE CASCADE,
  voice INTEGER DEFAULT 0,
  UNIQUE (nickname, thread)
);

CREATE TABLE IF NOT EXISTS forum_users (
        about TEXT DEFAULT NULL,
        fullname TEXT DEFAULT NULL,
        nickname CITEXT COLLATE "ucs_basic",
        email CITEXT,
        forum CITEXT COLLATE "ucs_basic",
        UNIQUE (nickname, forum)
);


CREATE INDEX users_nickname_idx ON users ((lower(nickname)));
CREATE INDEX  posts_id_idx ON posts (id);
CREATE INDEX  posts_thread_path_idx ON posts(thread, path);
CREATE INDEX  forum_users_forum_nickname_idx ON forum_users(forum, nickname);
CREATE INDEX  threads_forum_created_idx ON threads(forum, created);
CREATE INDEX  votes_thread_nickname_idx ON votes(thread, nickname);