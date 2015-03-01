Tasks = new Mongo.Collection("tasks");
showId = 3; 
Meteor.methods({
  addLike: function (idValue) {
    if(Likes.findOne({showIdent:{$in: [showId]}})== undefined){
    Likes.insert({
      showIdent: idValue,
      likes: 100,
      dislikes: 100
    });
  }
  },
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    Tasks.insert({
      likes: 0,
      text: text,
      show: showId,
      createdAt: new Date()
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);

    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  likes: function(taskId){
    console.log("increasing");
    Tasks.update(taskId, {$inc: {likes: 1}})
  }
});

if (Meteor.isServer) {
  // Only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function () {
    return Tasks.find(
      {})
  });
}

if (Meteor.isClient) {
   //default show id;
  //showId = Channel.getCurrentChannel();
  // This code only runs on the client
  Meteor.subscribe("tasks");
  
  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({show: {$in: [showId]}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    likes: function () {
      return Likes.find({showIdent: {$in: [showId]}}, {sort: {createdAt: -1}});
    },
    hideCompleted: function () { //used for html showing checkbox
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({show: {$in: [showId]} }).count();
    }
  });
  Template.body.events({
    "submit .new-task": function (event) {
      // This function is called when the new task form is submitted
      var text = event.target.text.value;

      Meteor.call("addTask", text);

      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.events({
    "click .toggle-likes": function(){
        Meteor.call("likes", this._id);
      },
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      console.log("restricted");
        if(typeof userId !== 'undefined' && userId == "jeff"){
            Meteor.call("deleteTask", this._id);
          }
        else{
          alert("Admin marked for deletion");
        }
        }
    });
  }
  