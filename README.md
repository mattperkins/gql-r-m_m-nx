# INSTALL 
## yarn 

# RUN 
## yarn start 

# ENDPOINTS 
## localhost: 

# DEPLOY 
## yarn build


generate date from js browser console
new Date().toISOString()




mutation {
  createEvent(eventInput: {
    title: "A test",
    description: "A description",
    price: 2.99,
    date: "2019-02-02T17:33:56.842Z"}) 
  {
    title
    description
    price
    date
  }
}

query {
  events {
    _id
    date
    title
    description
    price
  }
}
