# Introduction

The project will demonstrate on how to create a List of Website using pure Javascript, CSS, and HTML
in Cordova framwework.

The database used is indexedDB.

This will also used an inappBrowser plug-in

# Database
MODEL OF THE DATABASE

Database Name:MySitesDB
Table Name (ObjectStore): Sites

Attributes:
   1. Id : integer, auto-increment , unique
   2. name : string, unique, (the name of the site a user wants)
   3. url : string, unique, (the url of the site)

Methods:
1. createTable - create the database and table when loaded.
               - if the DB or table exists, it will disregard this method

2. createTxn - insert the data to the table
3. read - getall the data from the table and populate it in the UL tag
4. deleteTxn (key) - delete the data from the table with the key parameter
5. UpdateTxn (key,name, url) - this will update the name and url in the database with a key value given

# Video

Please the following link for the demonstration.

[![Image to Text To Speech](/images/thumbnail.jpg)](https://www.youtube.com/watch?v=wb1dzLBNWK4 "Image to Text To Speech")