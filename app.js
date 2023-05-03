//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://kaifaiz234:Lck4kKw0ZSoJeTHm@cluster0.0vttvjx.mongodb.net/todoListDB');

const itemsSchema = new mongoose.Schema({
  task: String
})

const items = mongoose.model("Item", itemsSchema);

const item1 = new items({
  task: "Welcome to your todolist!",
});
const item2 = new items({
  task: "Hit the + button to add a new item.",
});
const item3 = new items({
  task: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  items.find().then((results) => {
    if (results.length === 0) {
      items.insertMany(defaultItems).then(() => {
        console.log("Success");
      }).catch((err) => {
        console.log(err);
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: results });
    }
  }).catch((err) => {
    console.log(err);
  })
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const customList = req.body.list;
  const freshItem = new items({
    task: item
  });
  if (customList == "Today") {
    freshItem.save();
    res.redirect('/');
  }
  else {
    List.findOne({ name: customList }).then((foundList) => {
      foundList.items.push(freshItem);
      foundList.save();
      res.redirect("/" + customList);
    }).catch((err) => {
      console.log(err);
    })
  }
});

app.post("/delete", function (req, res) {
  const deleteItemId = req.body.check;
  const listName = req.body.inputitem;
  if (listName === "Today") {
    items.findByIdAndRemove(deleteItemId).then(() => {
      console.log("deleted");
      res.redirect("/");
    }).catch((err) => {
      console.log(err);
    })
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: deleteItemId } } }).then((result) => {
      res.redirect("/" + listName);
    }).catch((err) => {
      console.log(err);
    })
  }
})

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then((results) => {
    if (results) {
      //Show an existing List
      res.render("list", { listTitle: results.name, newListItems: results.items });
    }
    else {
      //Create a new List
      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save();
      res.redirect("/" + customListName);
    }
  }).catch((err) => {
    console.log(err);
  })
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);