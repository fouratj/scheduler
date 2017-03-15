function scheduler () {
    this.checkSetup();

    // Shortcuts to DOM Elements.
    //this.submitButton = document.getElementById('submit');
    this.signInButton = document.getElementById('sign-in');
    this.signOutButton = document.getElementById('sign-out');

    this.itemForm = document.getElementById('addItem');
    //this.saveTaskButton = document.getElementById('saveTask');

    // Saves message on form submit.
    this.itemForm.addEventListener('submit', this.saveItem.bind(this));
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInButton.addEventListener('click', this.signIn.bind(this));

    
    this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
scheduler.prototype.initFirebase = function() {
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.storageRef = this.storage.ref();
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this)); // Initiates Firebase auth and listen to auth state changes.
};

// Signs-in Friendly Chat.
scheduler.prototype.signIn = function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);
};

scheduler.prototype.signInFB = function () {
    var provider = new firebase.auth.FacebookAuthProvider();
    this.auth.signInWithPopup(provider);
}

// Signs-out of Friendly Chat.
scheduler.prototype.signOut = function() {
    console.log("signout");
    this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
scheduler.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    //var profilePicUrl = user.photoUrl;
    //var userName = user.displayName;

    // Set the user's profile pic and name.
    //this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    //this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    //this.userName.removeAttribute('hidden');
    //this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');
    this.signInButton.setAttribute('hidden', 'true');
    this.loadTodos();
    // We save the Firebase Messaging Device token and enable notifications.
    
  } else { // User is signed out!
    console.log('authStateChanged');
    console.log(user)
    this.signOutButton.setAttribute('hidden', 'true');
    this.signInButton.removeAttribute('hidden');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
scheduler.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Cloud Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.');
  }
};

scheduler.prototype.loadTodos = function () {
    var pathReference = this.storage.ref('todos'), todoURL;
    /*
    pathReference.getDownloadURL().then(function(url) { 
        
        todoURL = url;

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        console.log('Getting ToDos');
        xhr.onload = function(e) {
            window.app.$emit('network', xhr.response)
        };
        xhr.open('GET', todoURL);
        xhr.send();
    });*/

    var todos = firebase.database().ref('todos');

    todos.on('value', function(snapshot) {
        //updateStarCount(postElement, snapshot.val());
        let todos = snapshot.val();
        let todosArray = [];

        for (let todo in todos) {
            todosArray.push({
                "completed": todos[todo].completed,
                "dueDate": todos[todo].dueDate,
                "name": todos[todo].name,
                "priority": todos[todo].priority
            })
        }
        console.log(snapshot.val())
        console.log(todosArray)
        window.app.$emit('network', todosArray)
    });
};

scheduler.prototype.saveTodos = function (e) {
    if (e)
        e.preventDefault();

    console.log('submit');
    /*
    var ref = this.storageRef.child("todos");
    var todos = JSON.stringify(window.app.allTodos);
    ref.putString(todos).then(function(snapshot) {
        console.log('Uploaded a raw string!');
        console.log(todos);
        window.app.$emit('network', JSON.parse(todos));
    });
    */
};

scheduler.prototype.updateTodo = function (todo) {
    console.log('update')
    console.log(todo)
    let id = (todo.name + todo.dueDate).replace(/\//g, '');

    this.database.ref('todos/' + id).update(todo);
};

scheduler.prototype.saveItem = function (e) {
    //function writeUserData(userId, name, email, imageUrl) {
    e.preventDefault();
    let todo = window.app.firstTodo;
    let id = (todo.name + todo.dueDate).replace(/\//g, '');
    console.log('Save to DB');
    this.database.ref('todos/' + id).set({
        name: todo.name,
        dueDate: todo.dueDate,
        priority: todo.priority,
        completed: todo.completed
    });

};

window.onload = function() {
  window.scheduler = new scheduler();
};