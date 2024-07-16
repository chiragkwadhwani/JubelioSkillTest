-- Database: jubelioecommerce

-- DROP DATABASE IF EXISTS jubelioecommerce;

CREATE DATABASE jubelioecommerce
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Indonesian_Indonesia.1252'
    LC_CTYPE = 'Indonesian_Indonesia.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE TABLE public."Product"
(
    id SERIAL PRIMARY KEY, 
    Title VARCHAR (1000) NOT NULL,
    SKU VARCHAR (50) UNIQUE,
    Image bytea, 
    Price NUMERIC(10,2) NOT NULL, 
    Description VARCHAR (5000),
    Stock integer
);

ALTER TABLE IF EXISTS public."Product"
    OWNER to postgres;

CREATE TABLE public."Transaction"
(
    id SERIAL PRIMARY KEY, 
    SKU VARCHAR (50) NOT NULL,
    Qty integer NOT NULL,
    Amount NUMERIC(10,2)
);

ALTER TABLE IF EXISTS public."Transaction"
    OWNER to postgres;