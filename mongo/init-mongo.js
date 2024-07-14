db.createUser({
    user: 'admin',
    pwd: 'secret',
    roles: [
      {
        role: 'root',
        db: 'admin'
      }
    ]
  });
  
  db = db.getSiblingDB('exercisedatabase');
  db.createUser({
    user: 'exercise',
    pwd: 'Exercise123',
    roles: [
      {
        role: 'readWrite',
        db: 'exercisedatabase'
      }
    ]
  });
  
  db.createCollection('exercisecollection');
  