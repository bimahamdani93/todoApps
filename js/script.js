document.addEventListener("DOMContentLoaded", function () {   //sebuah listener yang akan menjalankan kode yang ada didalamnya ketika event DOMContentLoaded dibangkitkan
  const submitForm = document.getElementById("form");

  submitForm.addEventListener("submit", function (event) {    //event listener pada buttons submit
    event.preventDefault();                                   //menyimpan data dalam memory
    addTodo();
  });

  if(isStorageExist()){
    loadDataFromStorage();
}
});

const todos = [];
const RENDER_EVENT = "render-todo";          //nama dari Custom Event yang akan kita buat, yang mana nantinya akan kita gunakan sebagai dasar ketika ada perubahan pada variabel todos, seperti perpindahan todo, menambah todo, maupun menghapus todo. 

function addTodo() {
  const textTodo = document.getElementById("title").value;
  const timestamp = document.getElementById("date").value;

  const generatedID = generateId();
  const todoObject = generateTodoObject(
    generatedID,
    textTodo,
    timestamp,
    false
  );
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

//mengacak id
function generateId() {
  return +new Date();
}

function generateTodoObject(id, task, timestamp, isCompleted) {
  return {
    id,
    task,
    timestamp,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(todos);
});

//menampilkan list
function makeTodo(todoObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = todoObject.task;

  const textTimestamp = document.createElement("p");
  textTimestamp.innerText = todoObject.timestamp;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");       //menamai kelas
  textContainer.append(textTitle, textTimestamp); //memasukkan text pada container

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `todo-${todoObject.id}`);  //set atribute conatiner

  //menambah tampilan checklist
  if (todoObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(todoObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(todoObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      addTaskToCompleted(todoObject.id);
    });

    container.append(checkButton);
  }

  return container;
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById("todos");
  uncompletedTODOList.innerHTML = "";

  const completedTODOList = document.getElementById("completed-todos");
  completedTODOList.innerHTML = "";

 

  for (todoItem of todos) {
    const todoElement = makeTodo(todoItem);
   
    if (todoItem.isCompleted == false) uncompletedTODOList.append(todoElement);
    else completedTODOList.append(todoElement);
  }
});

//agar check bisa berfungsi
function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

//mencari todo dengan ID yang sesuai pada array todos
function findTodo(todoId) {
  for (todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

//Membuang list
function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);
  if (todoTarget === -1) return;
  todos.splice(todoTarget, 1);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

//mengundo
function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findTodoIndex(todoId) {
  for (index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

//jika  browser yang dipakai memang mendukung localStorage
function saveData() {
  if (isStorageExist()) {  //mengecek apakah didukung local storage
    const parsed = JSON.stringify(todos);   //konversi ke string
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}


const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";


function isStorageExist() /* boolean */ {
  if(typeof(Storage) === undefined){
      alert("Browser kamu tidak mendukung local storage");
      return false
  }
  return true;
}


//memanggil getItem(KEY) untuk mengambil data dari localStorage
document.addEventListener(SAVED_EVENT, function() {
  console.log(localStorage.getItem(STORAGE_KEY));
});


//meampilkan data  dari local storage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
 
  let data = JSON.parse(serializedData);
 
  if(data !== null){
      for(todo of data){
          todos.push(todo);
      }
  }


  document.dispatchEvent(new Event(RENDER_EVENT));
}