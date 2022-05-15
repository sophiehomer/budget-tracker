// hold the DB connection
let db;

// establish connection to IndexedDB database & set to version 1
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;

  // creates an object store
  db.createObjectStore("budget_tracker", { autoIncrement: true });
};

request.onsuccess = function (event) {
  // when db is successfully created with its object store
  db = event.target.result;

  // if app is online, run uploadTransaction()
  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// function will execute if attempting a new sumbission with no internet connection
function saveRecord(record) {
  // open new transaction with database with read & write permission
  const transaction = db.transaction(["budget_tracker"], "readwrite");

  // access the object store for 'budget_tracker'
  const budgetObjectStore = transaction.objectStore("budget_tracker");

  // add record to store
  budgetObjectStore.add(record);
}

function uploadBudget() {
  // open a transaction on db
  const transaction = db.transaction(["budget_tracker"], "readwrite");

  // access object store
  const budgetObjectStore = transaction.objectStore("budget_tracker");

  // get all store records
  const getAll = budgetObjectStore.getAll();

  // execute if getAll() is successfull
  getAll.onsuccess = function () {
    // fetch if data exists in store
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open on more transaction
          const transaction = db.transaction(["budget_tracker"], "readwrite");

          // access budget_tracker object store
          const budgetObjectStore = transaction.objectStore("budget_tracker");

          // clear all items in your store
          budgetObjectStore.clear();
          alert("All transactions have been submitted");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app 
window.addEventListener("online", uploadBudget);
