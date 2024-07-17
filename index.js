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

const dateStringToUTC = (dateString) => {
  return DateTime.fromISO(dateString, { zone: 'utc' }).toJSDate();
};

const utcToDateString = (utcDate) => {
  return DateTime.fromJSDate(utcDate).toUTC().toFormat('ccc LLL dd yyyy').toString();
};


const logRequestDetails = (req, res, next) => {
  if (req.method === 'POST') {
    console.log('--- Incoming POST Request ---');
    console.log('URL:', req.originalUrl);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Body:', JSON.stringify(res.body, null, 2));
    console.log('-----------------------------');
  

    const originalSend = res.send;
    res.send = function (body) {
      console.log('--- Outgoing Response ---');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', body);
      originalSend.apply(res, arguments);
  };
}
  next();
};

app.use(logRequestDetails);

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
    console.log(req.body);
    const id = req.params._id;
    const { description, duration } = req.body;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    let dateString = req.body.date;

    if (!dateString || !dateRegex.test(dateString)) {
      dateString = new Date().toISOString().slice(0,10);
    } 

    findByIdAndInsert(exerciseModel, id, 'log', {description: description, duration: duration, date: dateStringToUTC(dateString)})
      .then(({ _id, username, log}) => {
        res.send({
                  username: username,        
                  description: description,
                  duration: Number(duration),
                  date: utcToDateString(dateStringToUTC(dateString)),
                  _id: _id,                              
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
           logs = logs.filter(log => log.date >= dateStringToUTC(from));
         }
 
         if (to) {
           logs = logs.filter(log => log.date <= dateStringToUTC(to));
         }
 
         if (limit) {
           logs = logs.slice(0, parseInt(limit, 10));
         }
 
         const response = {
           _id: user._id,
           username: user.username
         }

         if (from) {
          response.from = utcToDateString(dateStringToUTC(from));
        }

        if (to) {
          response.to = utcToDateString(dateStringToUTC(to));
        }

        response.count = logs.length;
        response.log = logs.map(entry => ({
             description: entry.description,
             duration: entry.duration,
             date: utcToDateString(entry.date)
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
