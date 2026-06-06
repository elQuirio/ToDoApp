import { useSelector, useDispatch } from 'react-redux';
import { collapseAll, searchBtnToggle, updateSearchString } from "../slices/uiTodoSlicer";
import { updatePreferences } from '../thunks/preferencesThunk';
import { selectSortDirection, selectTodoViewMode, selectSortBy } from '../selectors/preferencesSelector';
import { selectSearchBtnToggled } from '../selectors/uiSelectors';
import { selectMainView } from '../selectors/preferencesSelector';
import { selectActiveTodos, selectCompletedTodos, selectOverdueTodos } from '../selectors/todoSelectors';
import { SortMethodSwitch } from '../components/sortMethodSwitch';
import { Search, Minimize2, ArrowUpNarrowWide, ArrowDownNarrowWide, BotMessageSquare } from "lucide-react";
import { CHAT_ENABLED } from '../config/api.js';

export function TodoStatusBar({ searchString }) {
    const activeTodos = useSelector(selectActiveTodos);
    const completedTodos = useSelector(selectCompletedTodos);
    const overdueTodos = useSelector(selectOverdueTodos);
    const currentDirection = useSelector(selectSortDirection);
    const todoViewMode = useSelector(selectTodoViewMode);
    const currentSortBy = useSelector(selectSortBy);
    const searchButtonActive = useSelector(selectSearchBtnToggled);
    const mainViewMode = useSelector(selectMainView);
    const isChatEnabled = CHAT_ENABLED;

    let sortComponent = '';

    const dispatch = useDispatch();


    function handleCollapseAll() {
        dispatch(collapseAll());
    }

    function handleSortTodos() {
        if (currentDirection=="asc") {
            dispatch(updatePreferences({sortDirection: "desc"}));
        } else if (currentDirection== "desc") {
            dispatch(updatePreferences({sortDirection: "asc"}));
        } 
    }

    function handleShowAll() {
        dispatch(updatePreferences({todoViewMode: 'all'}));
    }

    function handleShowActive() {
        dispatch(updatePreferences({todoViewMode: 'active'}));
    }

    function handleToggleSearch() {
        dispatch(updateSearchString({text: searchString}));
        dispatch(searchBtnToggle());
    }

    function handleToggleChat() {
        dispatch(updatePreferences({mainView: 'chat'}));
    }

    if (currentDirection === "desc") {
        sortComponent = <ArrowDownNarrowWide className='sort-icon' size={18}/>
    } else {
        sortComponent = <ArrowUpNarrowWide className='sort-icon' size={18}/>
    }


    return <div className="status-bar-mini">
            <span className='quick-actions-container'>
                <button className={`search-button quick-actions-button ${searchButtonActive?"active":""}`} onClick={handleToggleSearch} title='Search mode' aria-label='Search mode'><Search className='search-icon' size={18}/></button>
                {isChatEnabled && <button className={`chat-button quick-actions-button ${mainViewMode==='chat'?"active":""}`} onClick={handleToggleChat} title='Chat mode' aria-label='Chat mode'><BotMessageSquare className='chat-icon' size={18}/></button> }
                <button className={`sort-button quick-actions-button ${currentSortBy === 'manual' ? 'disabled' : ''}`} disabled={(currentSortBy === 'manual')} onClick={handleSortTodos} title='Sort direction' aria-label='Sort direction'>{sortComponent}</button>
                <button className='collapse-button quick-actions-button' onClick={handleCollapseAll} title='Collapse all todos' aria-label='Collapse all todos' ><Minimize2 className='collapse-icon' size={18}/></button>
                <SortMethodSwitch />
            </span>
            <span className='status-chip-container'>
                <span className='status-chip'>Active: {activeTodos.length}</span>
                <span className="dot"> | </span>
                <span className='status-chip'>Completed: {completedTodos.length}</span>
                <span className="dot"> | </span>
                <span className='status-chip'>Overdue: {overdueTodos.length}</span>
            </span>
                <span className='todoViewMode-selector-container'>
                    <div className={`selector-thumb ${todoViewMode}`}/>
                        <button type='button' className={`todoViewMode-button ${todoViewMode === 'active' ? 'active' : ''}`} onClick={handleShowActive}>Active</button>
                        <button type='button' className={`todoViewMode-button ${todoViewMode === 'all' ? 'active' : ''}`} onClick={handleShowAll}>All</button>
                    </span>
        </div>
}
