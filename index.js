const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const { connectDB, defineModel, addNewRecord, findByFields, findById, findByIdAndInsert } = require('./mongo/dbCommon');

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

connectDB(process.env.MONGO_URI);

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const exerciseModel = defineModel('exerciseModel', {
  username: {
      type: String,
      required: true
  },
  log: [{
    description: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  }]
    
});

app.route("/api/users")
   .get((req, res) => findByFields(exerciseModel, {}, {username: 1, _id: 1})
                        .then(foundRecords => res.json(foundRecords)))
   .post((req,res) => {
    addNewRecord(exerciseModel, {username: req.body.username})
      .then(({username, _id}) => res.json( {username: username, _id: _id}));
   });

app.route("/api/users/:_id/exercises")
   .post((req, res) => {
    const id = req.params._id;
    const { description, duration } = req.body;
    let dateString = req.body.date;
    if (!dateString) {
      dateString = new Date().toISOString().slice(0,10);
    }
    findByIdAndInsert(exerciseModel, id, 'log', {description: description, duration: duration, date: new Date(dateString)})
      .then(({ _id, username, log}) => {
        res.json({_id: _id,
                  username: username,
                  date: new Date(dateString).toDateString(),
                  duration: parseInt(duration),
                  description: description                                 
        });
      });
   });

   app.route("/api/users/:_id/logs")
   .get((req, res) => {
     const { from, to, limit } = req.query;
     const userId = req.params._id;
 
     findById(exerciseModel, userId)
       .then(user => {
         if (!user) {
           return res.status(404).json({ error: "User not found" });
         }
 
         let logs = user.log;
 
         if (from) {
           logs = logs.filter(log => log.date >= new Date(from));
         }
 
         if (to) {
           logs = logs.filter(log => log.date <= new Date(to));
         }
 
         if (limit) {
           logs = logs.slice(0, parseInt(limit, 10));
         }
 
         const response = {
           _id: user._id,
           username: user.username
         }

         if (from) {
          response.from = new Date(from).toDateString();
        }

        if (to) {
          response.to = new Date(to).toDateString();
        }

        response.count = logs.length;
        response.log = logs.map(entry => ({
             description: entry.description,
             duration: entry.duration,
             date: entry.date.toDateString()
           }));

        res.json(response);
       })
       .catch(err => {
         console.error('Error fetching user logs:', err);
         res.status(500).json({ message: 'Server error', error: err });
       });
   });
 

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
