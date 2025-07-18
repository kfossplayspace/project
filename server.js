const express = require('express');
const bodyParser = require('body-parser');
const da = require("./data-access");
const path = require('path'); 
const checkApiKey = require("./security").checkApiKey;
const getNewApiKey = require("./security").getNewApiKey;
const app = express();
const port = process.env.PORT || 4000;  // use env var or default to 4000

app.use(bodyParser.json());

// Set the static directory to serve files from
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log("staticDir: " + staticDir);
});

app.get("/apikey", async (req, res) => {
    let email = req.query.email;
    if(email){
        const newApiKey = getNewApiKey(email);
        res.send(newApiKey);
    }else{
        res.status(400);
        res.send("an email query param is required");
    }   
});

app.get("/reset", async (req, res) => {
    const [result, err] = await da.resetCustomers();
    if(result){
        res.send(result);
    }else{
        res.status(500);
        res.send(err);
    }   
});

app.get("/customers/find", async (req, res) => {
  const keys = Object.keys(req.query);

  // Require exactly one query string field
  if (keys.length === 0) {
    return res.status(400).send("query string is required");
  }
  if (keys.length > 1) {
    return res.status(400).send("only one query field is allowed");
  }

  const field = keys[0];
  const value = req.query[field];

  const [results, err] = await da.findCustomers(field, value);

  if (results) {
    res.send(results);
  } else {
    res.status(400).send({ error: err });
  }
});


app.get("/customers", checkApiKey, async (req, res) => {
    const [cust, err] = await da.getCustomers();
    if(cust){
        res.send(cust);
    }else{
        res.status(500);
        res.send(err);
    }   
});

app.get("/customers/:id", async (req, res) => {
    const id = req.params.id;
    const [cust, err] = await da.getCustomerById(id);
    if(cust){
        res.send(cust);
    }else{
        res.status(404);
        res.send(err);
    }   
});

app.post('/customers', async (req, res) => {
    const newCustomer = req.body;
    if (newCustomer === null) {
        res.status(400);
        res.send("missing request body");
    } else {
        // return array format [status, id, errMessage]
        const [status, id, errMessage] = await da.addCustomer(newCustomer);
        if (status === "success") {
            res.status(201);
            let response = { ...newCustomer };
            response["_id"] = id;
            res.send(response);
        } else {
            res.status(400);
            res.send(errMessage);
        }
    }
});

app.put('/customers/:id', async (req, res) => {
    const id = req.params.id;
    const updatedCustomer = req.body;
    if (updatedCustomer === null) {
        res.status(400);
        res.send("missing request body");
    } else {
        delete updatedCustomer._id;
        // return array format [message, errMessage]
        const [message, errMessage] = await da.updateCustomer(updatedCustomer);
        if (message) {
            res.send(message);
        } else {
            res.status(400);
            res.send(errMessage);
        }
    }
});

app.delete("/customers/:id", async (req, res) => {
    const id = req.params.id;
    // return array [message, errMessage]
    const [message, errMessage] = await da.deleteCustomerById(id);
    if (message) {
        res.send(message);
    } else {
        res.status(404);
        res.send(errMessage);
    }
});


