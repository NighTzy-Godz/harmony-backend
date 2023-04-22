<h1 align="center">
  <br>
<img src="https://raw.githubusercontent.com/NighTzy-Godz/test/master/HARMONY.png" width="70%">
  <br>
  Harmony - Server Side
  <br>
</h1>

<h4 align="center">A Hospital Management System that is built on top of <a href="https://react.dev" target="_blank">React</a> and <a href="https://nodejs.org/en"> NodeJs </a> with <a href="https://expressjs.com">Express</a> </h4>

# Quick Introduction

This project repository contains the code for the server-side or backend of the web application **Harmony**. It utilizes several technologies and libraries such as MongoDB for the database, Bcrypt for password hashing, JOI for data validation, and JsonWebToken for user authentication and authorization. The back-end provides API endpoints for patients, doctors, and admins, allowing them to perform various actions such as requesting/canceling appointments, managing prescriptions, and updating account information.

## Table of Contents
- [Technologies Used](#technologies-used)
- [Cloudinary Instructions](#cloudinary-instructions)
- [How to Use](#how-to-use)
- [API Documentation](#api-documentation)
  - [Patient Endpoints](#patient-endpoints)
  - [Doctor Endpoints](#doctor-endpoints)
  - [Admin Endpoints](#admin-endpoints)
- [Environment Variables](#environment-variables)

## Technologies Used

- Node Js - JavaScript runtime for building server-side applications
- Express Js - Node.js framework that provides a set of features for building web and mobile applications.
- Bcrypt - Password-hashing function for securely storing passwords in a database.
- Mongoose - Node.js library for interacting with MongoDB databases by defining schemas and models for your data.
- MongoDB - Scalable and flexible NoSQL database for storing and retrieving structured and unstructured data.
- JOI - Validation library for Express that helps developers validate user input and data sent to the server.
- JsonWebToken - Library for creating and verifying secure JSON Web Tokens used for user authentication and authorization in web applications.
- Cloudinary - Cloud-based media management platform for storing, managing, optimizing, and delivering images, videos, and other media content to websites and applications.
 
## Cloudinary Instructions

Cloudinary is one of the technologies used in this web application for processing images, and to work it on your machine, you need to follow these steps first:
1. Go to the [Cloudinary Website](https://cloudinary.com) and sign up for a free account.
2. Once you've signed up, you'll be redirected to your Cloudinary dashboard. From there, click on the **Account Details** tab.
3. Under **Account Details**, you'll find your **Cloudinary Cloud name**, **API Key**, and **API Secret**. Copy these values and keep them safe as you will need those values for your [environment variables](#environment-variables)
 
## How to Use

1. To clone and use this server-side project, you'll need to download these items:

- [Git](https://git-scm.com)
- [Node.Js](https://nodejs.org/en)

2. If it's downloaded, you can now follow the steps below

```bash
# Clone this repository
  git clone https://github.com/NighTzy-Godz/harmony-backend.git

# Go into the repository
  cd harmony-backend

# Install dependencies
  npm install
```
3. After that, create a .env file in the root directory of the project and fill in the required environment variables based on the [Env Section](#Environment-Variables).
4. Once you have set up your environment variables, start the server by running the following command:

```bash
# To start the server
  nodemon index.js
```

5. The server should now be running on your local machine. You can now make HTTP requests to the various endpoints of the API.
>**Note**
>Make sure to refer to the [API documentation](#API-Documentation) for a list of available endpoints and their corresponding request and response formats.


# API Documentation

For detailed API documentation and usage examples, please refer to the API documentation below.

## Patient Endpoints

GET Methods:
- `GET patient/me` - Get the Data of the current Patient.
- `GET patient/prescription` - Get the prescriptions of the Patient.
- `GET patient/medical-records` - Get the medical records of the Patient. Either Accepted or the Cancelled Appointments
- `GET patient/getAppointments` - Get the Pending Appointments of the Patient.


POST Methods:
- `POST patient/request-appt` - Patient will request an appointment.
- `POST patient/post-prescription` - Patient will mark as "Done" their prescription.
- `POST patient/cancel-appt` - Patient will cancel their requested appointment.
- `POST patient/post-apt/:appt_id` - Patient will remove the appointment after clicking the done or remove button.
- `POST patient/update-account` - Patient will update their account information.
- `POST patient/update-pass` - Patient will update their password
- `POST patient/login` - Patient login route.
- `POST patient/register` - Patient register route.

## Doctor Endpoints

GET Methods:

- `GET doctor/me` - Get the Data of the current Doctor.
- `GET doctor/all-doctors` - Get the All the Confirmed Doctors.
- `GET doctor/search_doc/:search` - Get the doctor depending on the Patient's search. The Doctor will either accept or decline it.
- `GET doctor/req-appts` - Get all the request appointments of the Doctor.
- `GET doctor/incoming-appts` - Get all the incoming appointments of the Doctor.

POST Methods:

- `POST doctor/post-appt` - Give the prescription after the appointment.
- `POST doctor/decide-appt` - Decide whether to accept or decline an appointment.
- `POST doctor/update-account` - Doctor will update their account information.
- `POST doctor/update-pass` - Doctor will update their password
- `POST doctor/login` - Doctor login route.
- `POST doctor/register` - Doctor register route.

## Admin Endpoints

GET Methods:
- `GET admin/me` - Get the Data of the current Admin.
- `GET admin/past-appts` - Get all the Past Appointments whether it is cancelled or not, but not with the pending ones.
- `GET admin/all-patients` - Get all the current registered Patients.
- `GET admin/unconfirmedDoctors` - Get all the unconfirmed or pending Doctors.

POST Methods:
- `POST admin/acceptDoctor` - Will decide if the admin will accept the pending Doctor.
- `POST admin/update-account` - Admin will update their account information.
- `POST admin/update-pass` - Admin will update their password
- `POST admin/login` - Admin login route.


# Environment Variables

The following environment variables are required to run the Hospital Management System backend:

* `PORT` - The port number on which the server should listen (e.g. 3000).
* `db_url` - The URL of the MongoDB database to connect to (e.g. mongodb://localhost/hospital).
* `jwtSecretPass` - The secret key to use for JWT token generation and validation.
* `admin_email` - The email that will use for creating the Admin.
* `CLOUDINARY_NAME` - The cloudinary name that is provided in cloudinary main website.
* `CLOUDINARY_KEY` - The cloudinary name  that is provided in cloudinary main website.
* `CLOUDINARY_SECRET` - The cloudinary secret password that is provided in cloudinary main website.

>**Note**
> Please refer on [Cloudinary Section](#cloudinary-instructions) on how to get the variables that starts with **CLOUDINARY**. Also you need those 3 cloudinary variables in order to work the images that you will upload on the server.

# CRUCIAL

After you finished all the Installations, environment variables, you must configure the admin first, because when you register on patient / doctor without the admin, it will throw an error saying `Admin did not found`.

So in your root directory, go to the folder `util` and find the `seeds.js`. Change the value depending on your needs, kindly look at the image below for reference.
![Instructions]

## Contact

If you have any questions or suggestions, please contact me at ajhubero16@gmail.com. I'll be happy to hear suggestions from you!
