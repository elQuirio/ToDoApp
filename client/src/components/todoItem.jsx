import { useDispatch } from "react-redux";
import { dragAndDropReorderTodos } from "../thunks/todoThunks";
import { updatePreferences } from "../thunks/preferencesThunk";
import { useTodoItem } from "../hooks/useTodoItem";
import { TodoDetails } from "./todoDetails";
import { TodoHeader } from "./todoHeader";


export function TodoItem({todoData}) {
    
    const dispatch = useDispatch();

    const {id, status, text, createdAt, updatedAt, toBeCompletedAt, isExpanded, position} = todoData;

    const {
        datePicker,
        todoItemCommands,
        todoHeader,
        todoItem: { doubleClick }
    } = useTodoItem({id, status, text, createdAt, updatedAt, toBeCompletedAt, isExpanded, position });


    function handleOnDragStart(e, id) {
        if (status !== 'completed') {
            e.dataTransfer.setData('text/plain', id);
            e.dataTransfer.effectAllowed = 'move';
        }
    }

    function handleOnDragOver(e, id) {
        if (status !== 'completed') {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            
            if (draggedId === String(id)) {
                e.dataTransfer.dropEffect = 'none';
                return;
            } else {
                e.dataTransfer.dropEffect = 'move';
            }
        }
    }
    
    async function handleOnDrop(e, id) {
        if (status !== 'completed') {
            e.preventDefault();
            const fromId = e.dataTransfer.getData('text/plain');
            const toId = id;
            if (!fromId || fromId === toId) return;
            
            await dispatch(dragAndDropReorderTodos({fromId, toId}));
            dispatch(updatePreferences({sortBy: "manual"}));
        }
    }


    return  <div className={`todo-item`} draggable onDragStart={(e) => handleOnDragStart(e, id)} onDragOver={(e) => handleOnDragOver(e, id)} onDrop={(e) => handleOnDrop(e, id)} onDoubleClick={() => doubleClick(status)} >
                < TodoHeader todoHeader={todoHeader} todoData={todoData} />
                { isExpanded && <TodoDetails todoData={todoData} todoItemCommands={todoItemCommands} datePicker={datePicker} /> }
            </div>
};
