CREATE SEQUENCE IF NOT EXISTS reference_id;

CREATE TABLE Users (
  username VARCHAR UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL
    CHECK (position('@' IN email) > 1),
  email_verified boolean DEFAULT false,
  is_admin boolean DEFAULT false
);

CREATE TABLE Locations (
  id SERIAL PRIMARY KEY,
  lat float8 NOT NULL,
  lng float8 NOT NULL,
  city TEXT,
  state CHAR(2)
);

-- Consider changing username to author/owner
CREATE TABLE Posts (
  id BIGINT DEFAULT nextval('reference_id') PRIMARY KEY,
  username INTEGER
    REFERENCES Users,
  location_id INTEGER
    REFERENCES Locations,
  created_at timestamp DEFAULT current_timestamp,
  subject TEXT,
  body text NOT NULL
);

CREATE TABLE Comments (
  id BIGINT DEFAULT nextval('reference_id') PRIMARY KEY,
  username INTEGER
    REFERENCES Users,
  post_reference_id INTEGER
    REFERENCES Posts ON DELETE CASCADE,
  comment_reference_id INTEGER
    REFERENCES Comments ON DELETE CASCADE,
  created_at timestamp DEFAULT current_timestamp,
  body text NOT NULL
);

CREATE TABLE Reporting_Agencies (
  ORI CHAR(9) UNIQUE PRIMARY KEY,
  Name TEXT NOT NULL,
  lat float8 NOT NULL,
  lng float8 NOT NULL,
  city TEXT,
  state CHAR(2) NOT NULL
);

CREATE TABLE Crimes (
  ORI CHAR(9) NOT NULL
    REFERENCES Reporting_Agencies,
  record_year INTEGER NOT NULL,
  offense TEXT NOT NULL,
  actual_cases INTEGER NOT NULL,
  cleared_cases INTEGER NOT NULL
);

CREATE TABLE Saved_Searches (
  id SERIAL PRIMARY KEY,
  username INTEGER
    REFERENCES Users,
  location_id INTEGER
    REFERENCES Locations,
  closest_ori TEXT
    REFERENCES Reporting_Agencies,
  created_at timestamp DEFAULT current_timestamp,
  title TEXT,
  user_comments TEXT
);

