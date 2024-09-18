"use client"
import { useEffect, useState, FormEvent } from "react";
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, query, orderBy, doc , Timestamp } from 'firebase/firestore';

type Todo = {
  id: string;
  todo: string;
  isCompleted: boolean;
  createdAt: Timestamp; 
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [isHover, setIsHover] = useState<string | null>(null);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    fetchTodoFirebase();
  }, []);

  // Fetch todos from Firebase
  const fetchTodoFirebase = async () => {
    try {
      const todoCollection = collection(db, "todos");
      const querySnapshot = await getDocs(query(todoCollection, orderBy("createdAt", "asc")));
      const todosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Todo[];
      setTodos(todosData);
    } catch (error) {
      console.error("Error fetching todos: ", error);
    }
  };

  // Add or update todo in Firebase
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return; 

    if (editingTodoId) {
      const todoRef = doc(db, "todos", editingTodoId);
      await updateDoc(todoRef, { todo: inputValue });
      setEditingTodoId(null);
      setWarning("");
    } else {
      const isDuplicate = todos.some(todo => todo.todo === inputValue);
      if (isDuplicate) {
        setWarning("Todo item already exists!");
        return;
      }
      await addDoc(collection(db, "todos"), {
        todo: inputValue,
        isCompleted: false,
        createdAt: serverTimestamp(),
      });
    }

    setInputValue('');
    fetchTodoFirebase();
    setWarning("");
  };

  // Delete todo from Firebase
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "todos", id));
    fetchTodoFirebase();
  };

  // Toggle completion status
  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    const todoRef = doc(db, "todos", id);
    await updateDoc(todoRef, { isCompleted: !isCompleted });
    fetchTodoFirebase();
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle edit button click
  const handleEditClick = (todo: Todo) => {
    setInputValue(todo.todo);
    setEditingTodoId(todo.id);
  };
  
  const filteredTodos = todos.filter(todo => todo.todo.toLowerCase().includes(inputValue.toLowerCase()));

  return (
    <div className="text-3xl text-center">
      <h1>Todo LIST (Bonus)</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Add or edit a todo..."
          className="mr-2 p-2 text-black"
        />
        <button className="btn bg-orange-400 p-2" type="submit">{editingTodoId ? 'Update' : 'Add'} Todo</button>
      </form>

      {warning && (
          <div className="text-red-500 mt-2 text-center">{warning}</div>
        )}

      <div className="mt-4">
      {filteredTodos.length === 0 && inputValue !== "" ? (
      <div className="text-red-500 mt-2 text-center">
        No result. Create a new one instead!
      </div>
    ) : (
      filteredTodos.map(todo => (
        <div key={todo.id} 
        onMouseEnter={() => setIsHover(todo.id)}
        onMouseLeave={() => setIsHover(null)} 
        className="flex items-center text-2xl justify-between p-2 w-3/6 m-auto">
          <span
            style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none' }}
            className="flex-1"
          >
            {todo.todo}
          </span>
          {isHover === todo.id && (
                <>
                  <button
                    className="bg-green-500 text-white py-1 px-2 rounded ml-2"
                    onClick={() => handleToggleComplete(todo.id, todo.isCompleted)}
                  >
                    {todo.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                  </button>
                  <button
                    className="bg-yellow-500 text-white py-1 px-2 rounded ml-2"
                    onClick={() => handleEditClick(todo)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white py-1 px-2 rounded ml-4"
                    onClick={() => handleDelete(todo.id)}
                  >
                    Remove
                  </button>
                </>
              )}
        </div>
      ))
    )}
      </div>
    </div>
  );
}

