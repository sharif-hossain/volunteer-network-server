const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const port = 5000
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;


require('dotenv').config()
console.log(process.env.DB_PASS)

const app = express()
app.use(bodyParser.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wwwk6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const collectionEvents = client.db(process.env.DB_NAME).collection("events");
  const volunteerCollections = client.db(process.env.DB_NAME).collection("volunteers");

  //add fakeData by admin
  app.post('/addEvent', (req, res) =>{
        const newEvents = req.body;
        console.log(newEvents)
        collectionEvents.insertMany(newEvents)
        .then(result =>{
          // console.log(result)
          console.log(result.insertedCount)
          res.send(result.insertedCount)
        })
      })
      //all data
      app.get('/events', (req, res)=>{
        collectionEvents.find({})
        .toArray((err, documents) =>{
          res.send(documents)
        })
      })
      
      
      //load single event
      app.get('/event/:id', (req, res) => {    
                collectionEvents.find({ _id: ObjectId(req.params.id) })
                    .toArray((err, documents) => {
                        res.send(documents[0]);
                    })
            });

      //particular user
      
      app.get('/addVolunteer', (req, res) => {
              const queryEmail = req.query.email;
              volunteerCollections.find({ email: queryEmail })
                .toArray((err, documents) => {
                    res.send(documents);
                })
            });

       //add each volunteer
      app.post('/register', (req, res) =>{
        const volunteer = req.body;
        volunteerCollections.insertOne(volunteer)
        .then(result =>{
          res.send(result.insertedCount>0)
        })
      })


      app.delete('/delete/:id', (req, res) => {
          volunteerCollections.deleteOne({ _id: ObjectId(req.params.id) })
              .then(result => {
                  res.send(result.deletedCount > 0);
              })
            })  
            // find all registered volunteer
            app.get('/registeredVolunteers', (req, res) => { 
                volunteerCollections.find({})
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
                  });      

      app.get('/', (req, res) =>{
        res.send('ok i am cool')
      })
});
app.listen(port)