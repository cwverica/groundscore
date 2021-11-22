# Groundscore

### The Basics

This is a project about scouting out an area you are not familiar with. It's base form will be to give data related to crime about an area of your choosing.


It will use the [FBI's Crime aggregate API](https://api.usa.gov/crime/fbi/sapi/) to pull data for the related crime in the area.

It will use [Google Maps API](https://maps.googleapis.com/maps/api) for Geocoding and Reverse Geocoding (converting addresses to Lattitude and Longitude coordinates, and vis-a-versa)


There will be a back-end Postgres database to cache searches (for faster recall) as well as to create users, save searches, and a section for creating posts/leaving comments.


The database layout is viewable in the Groundscore_DB.pdf in this directory. I have already started working on the database backend, but am open to suggestions.
