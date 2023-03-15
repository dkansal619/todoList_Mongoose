const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb+srv://dkansal619:dkansal619@deepak.rbyn5q4.mongodb.net/toDoListDB");
}

// creating schema for home route---
const ItemSchema = new mongoose.Schema({
  name: String
});

// creating model---
const Item = mongoose.model("Item", ItemSchema);



// creating three different documents
const item1 = new Item({
  name: "Welcome to this to list"
});

const item2 = new Item({
  name: "hit the + button to add new items.."
});
const item3 = new Item({
  name: "check the box to delete the added items."
});

// creating a default array
const default_Array = [item1, item2, item3];

// creating schema for the another route
const listSchema = new mongoose.Schema({
  name: String,
  items: [ItemSchema]
});

// creating model named List
const List = mongoose.model("List", listSchema);




// inserting the entire array into Item collection which is inside our databases
// Item.insertMany(default_Array);


app.use(express.urlencoded({ extended: true }));

// for making our local css work
app.use(express.static("public"));


// below code means we are using ejs
app.set('view engine', 'ejs');

app.get("/", function (req, res) {


  // printing all the items to console  when we go to home route i.e '/'
  Item.find({})
    .then((items) => {
      console.log(items);


      if (items.length === 0) {
        Item.insertMany(default_Array).then(() => {
          console.log("sucessfully added the items to the database");
        }).catch((err) => {
          console.log(err);
        })

        res.redirect("/");

      }
      else {
        res.render("list", { listTitle: "Today", newListItems: items });
      }
    })
    .catch((err) => {
      console.log(err);
    })
  // below we are rendering the list file list.ejs
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;

  // capturing the name of the list
  const listName = req.body.list;

  // adding itemName to our collection
  const Added_item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    Added_item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName})
    .then((foundList)=>{
      foundList.items.push(Added_item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }





});

// handling the delete route from the checkbox inside the list.ejs file
app.post("/delete", function (req, res) {
  const checked_item_id = req.body.checkbox;
  // capturing the list name
  const listName = req.body.listName;

  if(listName ==="Today"){
    
    Item.findByIdAndRemove(checked_item_id).then(() => {
      console.log("succesfully deleted the checked item");
      res.redirect("/");
    })
  } else{
      // if the list not Today then do this
      // finding the list by name and using $pull to remove the item from the field named items which is an array by prividing the query by using the id of the item that has been clicked
      List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checked_item_id}}}).then(()=>{
        res.redirect("/"+ listName);
      })
      
    }
});


// route parameters: means when the user enters any word after localhost:3000/ it will fetch that word
app.get("/:customListName", function (req, res) {
  // console.log(req.params.customListName);
  // making the only first letter capitlize while the rest of the letters are small
  const customList = _.capitalize(req.params.customListName);

  // list.save();
 List.findOne({ name: customList })

   // if we can find the relevant then do something by .then()
    .then((foundList) => {
  // if foundList is not zero then it exits otherwise it does not
      if (foundList) {
        //  does exits
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      } else {
        // does not exists and therfore we are creating one

        // creating new item for List model
        const list = new List({
          name: customList,
          items: default_Array
        });
        list.save();
        res.redirect("/"+ customList);
      }

    })
    // if there is any error then log those errors while finding the specific one
    .catch((err) => {
      console.log(err);
    })


});





app.post("/work", function (req, res) {
  let item = req.body.newItem; z
  workItems.push(item);
  res.redirect("/work");
});


app.get("/about", function (req, res) {

  // rendering about.ejs
  res.render("about");
})


app.listen(3000, function (req, res) {
  console.log("server is running on port 3000");
});