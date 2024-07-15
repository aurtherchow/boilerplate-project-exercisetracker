const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const { connectDB, defineModel, addNewRecord, findByFields, findById, findByIdAndInsert } = require('./mongo/dbCommon');
const { DateTime } = require('luxon');

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
      type: String,
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
    const description = req.body.description;
    const duration = req.body.duration;
    const dateString = req.body.date;

    findByIdAndInsert(exerciseModel, id, 'log', {description: description, duration: duration, date: dateString})
      .then(({ _id, username}) => {
        res.json({username: username,
                  description: description,
                  duration: duration,
                  date: DateTime.fromISO(dateString).toFormat('ccc LLL dd yyyy'),
                  _id: _id
        });
      });
   });

app.route("/api/users/:_id/logs")
   .get((req, res) => {
      const fromDateString = req.params.from;
      const toDateString = req.params.to;
      const limit = req.params.limit;

      
   })

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
