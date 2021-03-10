
/*-----------------------------------------------------
The following functions are for the inApp browser plug
----------------------------------------------------*/

var inAppBrowserRef;
function showBrowser(url) {
    var target = "_blank";
    var options = "location=yes,hidden=yes,beforeload=yes";

    let options = "location = yes,closebuttoncaption=Home,closebuttoncolor=#7c7646,navigationbuttoncolor=#8f3d00,hardwareback=yes,lefttoright=yes,hideurlbar=yes";   
   
    inAppBrowserRef = cordova.InAppBrowser.open(url, target, options);
    inAppBrowserRef.addEventListener('loadstart', loadStartCallBack);
}
function loadStartCallBack() {

    alert("loading please wait ...");

}

window.addEventListener("load", loadData); //once the app loaded, call the loadData function

let dbName = "MySitesDB";
let tableName = "sites";
let ParsedDataFrmDB = "";
var EditOrAdd = ""; //check whther the Add (+) is clicked or the Edit (in the list)
//when (+) is clicked, the value is "add", if edit (in the list)
// is clicked the value is "edit"

var li_tag = ""; //check the li tag this is clicked
var ul_parent = ""; //checked the parent which is the UL tag
var key = -1; //this is used for indexedDB. Check the keypath value of the selected item

/*-----------------------------------------
The loadData function calls the createTable 
function and populate history 
--------------------------------------------*/
function loadData() {
  createTable(dbName, tableName);
  populateHistory();
}

/*----------------------------------------
The method hideShow page will hide one page
and shows the other page.
For example, in this project, there are two views: home and add/update
it will show the home view, then hide the add/update view
------------------------------------------*/
function hideShowPage(showThisPage, HideThisPage) {
  showThisPage.style.display = "inline-block";
  HideThisPage.style.display = "none";
  //console.log(EditOrAdd);
}

/*------------------------------------------------
The btnFormShow button is the + button
in the footer.
When it is clicked, it will hide the home view,
and show the add page.
It will change also the value of the btnAdd button to "Add"
--------------------------------------------------*/
let ulLinks = document.getElementById("ul-links"); //
let btnFormShow = document.getElementById("btn-show-add");
let btnAdd = document.getElementById("btn-add");
let btnCancel = document.getElementById("btn-cancel");
let divlink = document.getElementById("div-link");
let divAdd = document.getElementById("div-add");
let txtSiteName = document.getElementById("siteName");
let txtSiteURL = document.getElementById("siteURL");
let NorecordFnd = document.getElementById("NorecordFnd");
let siteName = "";
let siteURL = "";
//show the input form
btnFormShow.addEventListener("click", function (e) {
  btnAdd.textContent = "Add"; //make the textContent value of the btnAdd to "Add"
  EditOrAdd = "add"; //
  txtSiteName.value = ""; //clear first the field in case there is a value from previous action
  txtSiteURL.value = ""; //clear first the field in case there is a value from previous action
  hideShowPage(divAdd, divlink); //hide the home view and show the input form (add) view
});

/*--------------------------------------------
When The btnAdd is clicke, it will either insert data to database
or update the existing data in the database.
When the the user wants to confirm yes, it will call the
EditOrAddProcess function
--------------------------------------------*/
btnAdd.addEventListener("click", function () {
  siteName = txtSiteName.value; //get the value from this field
  siteURL = txtSiteURL.value; //get the value from this field

  //Ask the user if wants to edit or add the data
  let wantToAddOrEdit = confirm(`Do you want to ${EditOrAdd} it?`);

  //if the user click Yes, it will execute the following
  if (wantToAddOrEdit == true) {
    if (siteName.length > 0 && siteURL.length > 0) {
      //check if the fields are empty
      EditOrAddProcess(EditOrAdd, siteName, siteURL); //call this method EditOrAddProcess
    } else {
      //inform the user to fill in the fields
      alert("Please fill in the fields.");
    }
  }
});

/*----------------------------------------------------
When the cancel button is clicked,
it just hide the add/edit view and show the home view
------------------------------------------------------*/
btnCancel.addEventListener("click", function () {
  hideShowPage(divlink, divAdd);
});

/*-----------------------------------------------------
ulLinks is the parent node (UL tag).
When the UL tag is clicked, it will check which child is
being clicked.
Inside the li tag, has edit or delete button.
It will check which button is clicked.

When either edit or delete button is clicked,
it will get the keypath value (key span tag).

When the target is delete,it will delete the data.
When the target is edit, it will hide the home view
and show the add_edit view.
This will then change the value of the btnAdd to "Update"
----------------------------------------------------------------*/
ulLinks.addEventListener("click", function (e) {
  if (e.target.className == "delete" || e.target.className == "edit") {
    key = getKey(e);
  }
  if (e.target.className == "delete") {
    let isDeleted = confirm("Do you want to delete it?");
    if (isDeleted == true) {
      deleteTxn(key);
    }
  } else if (e.target.className == "edit") {
    btnAdd.textContent = "Update";
    EditOrAdd = "edit";
    //show the add page
    hideShowPage(divAdd, divlink);
    //put the value in the textbox
    //li tag has three children.
    txtSiteName.value = li_tag.children[0].innerHTML; //first child is the name span tag
    txtSiteURL.value = li_tag.children[1].innerHTML; //second child is the url span tag
  }

   //check if the class name is the name
  else if (e.target.className == "name"){
    
    const li=e.target.parentElement;
    let link = li.firstChild.nextSibling.textContent//get the value of the link
    console.log(link)
    showBrowser(link)
  }
  
});

/*-----------------------------------------------------
EditOrAddProcess method will add or update the
data to the database.
When the value of EditOrAdd variable is add,
it will create transaction (meaning, insert data to the database)
When the value of EditOrAdd variable is edit,
it will update the existing data
-----------------------------------------------------*/
function EditOrAddProcess(add_edit, siteName, siteURL) {
  if (add_edit == "add") {
    createTxn(dbName, tableName, siteName, siteURL);
    //hide the add form and show the home form
    hideShowPage(divlink, divAdd);
  } else if (add_edit == "edit") {
    //console.log(key);
    UpdateTxn(key, siteName, siteURL);
  }
}

/*------------------------------------------------------
The following function getKey will get the key value of the data
from the database
-----------------------------------------------------*/

function getKey(e) {
  li_tag = e.target.parentNode.parentNode;
  ul_parent = li_tag.parentNode.children;
  let keyPath = li_tag.children[2].innerHTML;
  console.log("my key" + keyPath);
  return keyPath;
}

/*-------------------------------
The function createLink will create  chilnode (li tag)
Li tag has children: name of the url the user wants, the url and the delete button
These will be dynamically created using DOM (Data Object Model) manuipulation
The structure will look like the following
<ul>
  <li class="li">
    <span class="name">Site Name</span>
    <span hidden=true >Site URL</span>
    <span hidden=true >key</span>
    <span class="spanEdit">
       <button class="edit">Edit</button>
       <button>Update</button>
       <button>cancel</button>
       <button class="delete">Delete</button>
    </span>
  </li>
</ul>

-------------------------------------*/
//Initialize the ul tag and clear history button
//function to links
function createLink(name, link, id) {
  let li = document.createElement("li"); //create li tag
  let sname = document.createElement("span"); //create span tag
  let slink = document.createElement("span"); //create span tag
  let skey = document.createElement("span"); //create span tag
  let sEdit = document.createElement("span"); //create span tag
  //let arrow=document.createElement('span');//create span tag

  sname.textContent = name;
  slink.textContent = link;
  skey.textContent = id;
  slink.style.display = "none";
  skey.style.display = "none";

  let btnEdit = document.createElement("button");
  let btnDelete = document.createElement("button");
  btnEdit.textContent = "Edit";
  btnDelete.textContent = "x";
  sEdit.appendChild(btnEdit); //append the span tag to li tag
  sEdit.appendChild(btnDelete); //append the span tag to li tag

  li.className = "li";
  sname.className = "name";
  sEdit.className = "spanEdit";
  btnDelete.className = "delete";
  btnEdit.className = "edit";

  li.appendChild(sname); //append the span tag to li tag
  li.appendChild(slink); //append the span tag to li tag
  li.appendChild(skey); //append the span tag to li tag
  li.appendChild(sEdit); //append the span tag to li tag
  // li.appendChild(arrow);//append the span tag to li tag
  ulLinks.appendChild(li); //append the li tag to ul tag
}

/*------------------------------------------------------
The deleteLink and updateLink are added to avoid reloading
the database.
Once the data is added or update in the database,
it will just remove the li tag or update the li tag
without fetching the data from the database.
---------------------------------------------------------*/

//function to delete the li element in client-sdie to avoid reloading the page
function deleteLink(ParentId, parentNode, childToDelete) {
  Array.from(parentNode).forEach((child) => {
    console.log(child);
    if (childToDelete == child) {
      ParentId.removeChild(child);
    }
  });
}

function updateLink(parentNode, childToUpdate) {
  Array.from(parentNode).forEach((child) => {
    if (childToUpdate == child) {
      child.children[0].innerHTML = siteName;
      child.children[1].innerHTML = siteURL;
    }
  });
}

/*-----------------------------------------------
FUNCTIONS FOR DB
----------------------------------------------*/
/*---------------------------------------------
MODEL OF THE DATABASE

Database Name:MySitesDB
Table Name (ObjectSote): Sites

Attributes:
   1. Id : integer, auto-increment , unique
   2. name : string, unique, (the name of the site a user wants)
   3. url : string, unique, (the url of the site)

Methods:
1. createTable - create the database and table when loaded.
               - if the DB or table exists, it will disregard this method

2. createTxn - insert the data to the table
3. read - getall the data from the table and populate it in the UL tag
4. deleteTxn (key) - delete the data from the table with the key parameter
5. UpdateTxn (key,name, url) - this will update the name and url in the database with a key value given
------------------------------------------------*/
function createTable(dbName, tableName) {
  var request = indexedDB.open(dbName, 1);
  request.onupgradeneeded = function (e) {
    var database = e.target.result;
    var objectStore = database.createObjectStore(tableName, {
      keyPath: "id",
      autoIncrement: true,
    });

    // Create an index to search customers by name. We may have duplicates
    // so we can't use a unique index.
    objectStore.createIndex("id", "id", {
      unique: true,
    });
    objectStore.createIndex("name", "name", {
      unique: true,
    });
    objectStore.createIndex("url", "url", {
      unique: true,
    });

    //console.log("Object Store Created");
  };
  request.onsuccess = function (e) {
    var database = e.target.result;
    //code to verify that the table was created
    database.objectStoreNames.contains(tableName);
    database.close();
  };
  request.onerror = function (e) {
    //console.error(e.target.error.message);
  };
}

function createTxn(dbName, tableName, name, link) {
  var request = indexedDB.open(dbName, 1);
  request.onsuccess = function (e) {
    var database = e.target.result;
    //code to verify that the table was created
    database.objectStoreNames.contains(tableName);
    add(database, tableName, name, link);
    database.close();
  };
  request.onerror = function (e) {
    //console.error(e.target.error.message);
  };
}

function add(db, tableName, name, url) {
  let request_objectstore = db
    .transaction([tableName], "readwrite")
    .objectStore(tableName)
    .add({ name, url });

  request_objectstore.onsuccess = function (event) {
    //console.log("The data has been written successfully");
    createLink(name, url, request_objectstore.result); //add to the UL node
    NorecordFnd.textContent = "";
  };

  request_objectstore.onerror = function (event) {
    //console.log("The data has been written failed");
    alert("Name exists in the database");
  };
}

function read(tableName) {
  var db = indexedDB.open(dbName, 1);
  db.onsuccess = function (e) {
    let database = e.target.result;
    let transaction = database.transaction([tableName]);
    let objectStore = transaction.objectStore(tableName);
    let request = objectStore.getAll();

    request.onerror = function (event) {
      //console.log("Transaction failed");
    };

    request.onsuccess = function (event) {
      let resultLen = request.result.length;
      console.log(resultLen);
      if (request.result) {
        ParsedDataFrmDB = request.result;
      }
      if (resultLen == 0) {
        //console.log("no record")
        NorecordFnd.textContent = "No data record";
      }
    };
  };
}

function populateHistory() {
  read(tableName);
  function data() {
    if (ParsedDataFrmDB == undefined) {
      //console.log("Data is being parsed");
    } else {
      clearInterval(loadData);
      generateData(ParsedDataFrmDB);
    }
  }
  const loadData = setInterval(data, 1000);

  function generateData(raps) {
    let len = raps.length;
    //loop thru len
    raps.forEach((mesg) => {
      createLink(mesg.name, mesg.url, mesg.id);
    });
  }
}

//delete from database..
function deleteTxn(keypath) {
  var DBOpenRequest = window.indexedDB.open(dbName, 1);

  DBOpenRequest.onsuccess = function (event) {
    // store the result of opening the database in the db variable. This is used a lot below
    db = DBOpenRequest.result;
    // Run the deleteData() function to delete a record from the database
    deleteData(keypath);
  };
}

function deleteData(keypath) {
  // open a read/write db transaction, ready for deleting the data
  var transaction = db.transaction([tableName], "readwrite");

  // report on the success of the transaction completing, when everything is done
  transaction.oncomplete = function (event) {
    console.log("Transaction completed.");
  };

  transaction.onerror = function (event) {
    console.log("Transaction not opened due to error: " + transaction.error);
  };

  // create an object store on the transaction
  var objectStore = transaction.objectStore(tableName);

  // Make a request to delete the specified record out of the object store
  var objectStoreRequest = objectStore.delete(Number(keypath));

  objectStoreRequest.onsuccess = function (event) {
    // report the success of our request
    alert("Delete item successfully.");
    deleteLink(ulLinks, ul_parent, li_tag); //it will delete tbe li tag without reloading the page.
  };
}

function UpdateTxn(key, name, url) {
  var DBOpenRequest = window.indexedDB.open(dbName, 1);

  DBOpenRequest.onsuccess = function (event) {
    // store the result of opening the database in the db variable. This is used a lot below
    db = DBOpenRequest.result;

    // Run the deleteData() function to delete a record from the database
    updateData(key, name, url);
  };
}

function updateData(key, name, url) {
  // Open up a transaction as usual
  var objectStore = db
    .transaction([tableName], "readwrite")
    .objectStore(tableName);

  // Get the to-do list object that has this title as it's title
  var objectStoreTitleRequest = objectStore.get(Number(key));

  objectStoreTitleRequest.onsuccess = () => {
    // Grab the data object returned as the result
    var data = objectStoreTitleRequest.result;

    // Update the notified value
    data.name = name;
    data.url = url;

    // Create another request that inserts the item back into the database
    var updateTitleRequest = objectStore.put(data);
    // Log the transaction that originated this request
    console.log(
      "The transaction that originated this request is " +
        updateTitleRequest.transaction
    );
    // When this new request succeeds, run the displayData() function again to update the display
    updateTitleRequest.onsuccess = () => {
      updateLink(ul_parent, li_tag);
      hideShowPage(divlink, divAdd);
    };
    updateTitleRequest.onerror = () => {
      alert("Name already exists");
    };
  };
}



