\echo 'Delete and recreate groundscore_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE groundscore_test;
CREATE DATABASE groundscore_test;
\connect groundscore_test

\i gs-schema.sql

\echo 'Delete and recreate groundscore db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE groundscore;
CREATE DATABASE groundscore;
\connect groundscore

\i gs-schema.sql
