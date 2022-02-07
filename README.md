# Groundscore

Project Currently Hosted: <https://groundscore.vercel.app/>

## The Basics

This is a project to help people scouting out an area they are not familiar with. In it's base form (v:1.0.1) it provides data related to crime about a chosen area.   
It may be useful for:
- people relocating because of a new job.
- people looking to purchase a home, and trying to figure out which area is best to do so.
- people going to a university in a different state who need to live off campus.
- companies trying to assess where to put their next office building or retail site.
   
   
It uses the [FBI's Crime aggregate API](https://api.usa.gov/crime/fbi/sapi/) to pull data for the related crime in the area.

It uses [Google Maps' API](https://maps.googleapis.com/maps/api) for Geocoding and Reverse Geocoding (converting addresses to Lattitude and Longitude coordinates, and vis-a-versa)


There is a back-end Postgres database to cache searches (for faster recall) as well as to create users, save searches, and a section for creating posts/leaving comments.[^1]
     
<br />
     
### Tech Used

**Frontend**
- ReactJS
- Bootstap
- Plotly.js
- react-google-maps
- use-places-autocomplete
- reach
- FontAwesome
- jsonwebtoken
- axios


**Backend**
- NodeJS
- Express
- PostgreSQL
- bcrypt
- jsonschema
- jsonwebtoken

<br />

---

## Installation

This repository is essentially comprised to two different apps working as one: The react app serving the frontend, and the database api on the backend. Therefore, I will go over the installation of each seperately. *Note*: if you are going to locally host this project, it is easiest to run two terminals at the same time.   
<br />

### *Backend*

1. Install the backend by navigating to the `backend` folder and executing:   
    > `npm install`    
2. While you are in this folder, seed your databased with the `groundscore.sql` file   
    > `psql` (or whatever command you use to enter postgres)   
    > `\i groundscore.sql`  

    Press enter to agree to both prompts   
3. Set up your postgresql connection string.   
    For a locally hosted environment:   
    > `PSQL_STRING = "postgres://username:password@localhost:port/"`   

    (Check with your hosting platform for their requirements for a connection string.   )

<br />
### *Frontend*

1. Install the frontend by navigating to the `frontend` folder and executing:   
    > `npm install`   
2. Set up your environment variables in a `.env` file in the `frontend` folder or as environment variables on any hosting platform you may be using. You will need:   
    a. `REACT_APP_BASE_URL` This is the url to the api for the backend of the project. If left empty, will still run on local host.   
    b. `REACT_APP_FBI_KEY` Attain your own by requesting an API key from the [US Goverment](https://api.data.gov/signup/) *Note*: this may take a few days, but you will receive your api key in the email you provided.   
    c. `REACT_APP_GOOGLE_API_KEY` Head on over to [Google's Cloud](https://cloud.google.com/) services. You will have to sign up for a google account if you do not already have one. From there, there are plenty of instructions to receive an API key.   


At this point the project is installed. Yaay! Now it's time to run the application, and test[^2] it out.

<br />

## Running Locally

If you are running this locally, you should have two open terminals: one with PWD in frontend, and one with PWD in backend.   
1. Enter `npm start` in the backend.   
    - Your local api should start.   
    - If you make any changes to the backend, you will have to kill the server (`ctrl + c`) and start it again.   
2. Enter `npm start` in the frontend.  
    - This may take a minute, but your default browser should open a tab to the app.  
    - If it does not, or gets closed while the server is running, you may find it here: [localhost:3000](http://localhost:3000/). 
    - If you make any changes to the frontend, hitting save will cause an update in the server. 
    - If the server crashes because of a error in the code, sometimes you must kill the server (`ctrl + c`) and restart it

---

## Possible Future Features

1. A forum/messageboard system where users can write posts and leave comments about different areas.

2. Ability for user to set the year range for the crime data search.

3. Crime per capita: incorporating population into the data, which will give a more relative picture.

4. Being able to select multiple locations, and do side-by-side comparisons of their data (crime per capita would be most useful here).

5. Incorporating public services data: proximity to hospitals, schools, parks, etc.

6. Incorporating Real Estate data.

---

### Footnotes

[^1]: Posts and Comments are not yet implemented, but the database is already structured to handle it.

[^2]: Automated tests are not in place as of this writing, but will be shortly. For now, manual testing is necessary.

