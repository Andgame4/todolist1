import "./style.scss";
import toast from "./Assets/toast.js";
import { fromJS } from "immutable";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Column from "./Components/Column/index.js";
import Task from "./Components/Task/index.js";
import AddNewModal from "./Components/AddNewModel/index.js";
import { v1 as uuidv1 } from "uuid";
import { Component } from "react";
import "./Assets/toast.scss";

class App extends Component {
  state = {
    displayModal: false,
    editingColumnIndex: "",
    taskContent: "",
    editingTaskIndex: null,
    editedTaskId: null,
    columns: fromJS([
      { id: "td", title: "TO DO", tasks: [] },
      { id: "ip", title: "IN PROGRESS", tasks: [] },
      { id: "de", title: "DONE", tasks: [] },
    ]),
  };
  componentDidMount() {
    const columns = localStorage.getItem("columns");
    if (columns) {
      this.setState({ columns: fromJS(JSON.parse(columns)) });
    }
  }
  handleToggleModal =
    (choosenColumn = "") =>
    () => {
      this.setState((prevState) => ({
        displayModal: !prevState.displayModal,
        editingColumnIndex: choosenColumn,
      }));
    };
  handleChangeTaskContent = (e) =>
    this.setState({ taskContent: e.target.value });
  handleChangeEditingColumnIndex = (editingColumnIndex) => () =>
    this.setState({ editingColumnIndex: editingColumnIndex });

  handleAddNewModal = () => {
    const { taskContent } = this.state;
    if (taskContent.trim() === "") {
      toast({
        title: "Error",
        message: "Vui lòng điền thông tin",
        type: "error",
        duration: 2000,
      });
    } else {
      const { editingColumnIndex, columns } = this.state;
      const newTask = fromJS({
        id: uuidv1(),
        content: taskContent,
        time: new Date().toLocaleString(),
      });
      const columnIndex = columns.findIndex(
        (column) => column.get("id") === editingColumnIndex
      );
      const updatedColumn = columns.updateIn([columnIndex, "tasks"], (tasks) =>
        tasks.push(newTask)
      );
      this.setState(
        {
          displayModal: false,
          editingColumnIndex: "",
          taskContent: "",
          columns: fromJS(updatedColumn),
        },
        () => {
          localStorage.setItem("columns", JSON.stringify(updatedColumn.toJS()));
        }
      );
    }
  };

  handleDeleteTask = (columnIndex, taskIndex) => () => {
    const result = window.confirm("Are your sure to delete this task?");
    if (result) {
      const { columns } = this.state;
      const updatedColumn = columns.updateIn([columnIndex, "tasks"], (tasks) =>
        tasks.remove(taskIndex)
      );
      this.setState({ columns: fromJS(updatedColumn) }, () => {
        localStorage.setItem("columns", JSON.stringify(updatedColumn.toJS()));
        toast({
          title: "Delete",
          message: "Xoá thành công",
          type: "success",
          duration: 2000,
        });
      });
    }
  };
  handleChooseEditTask = (columnIndex, taskIndex, taskId) => () => {
    this.setState({
      editingColumnIndex: columnIndex,
      editingTaskIndex: taskIndex,
      editedTaskId: taskId,
    });
  };

  handleEdit = () => {
    const { columns, editingColumnIndex, taskContent, editingTaskIndex } =
      this.state;
    const updatedColumn = columns.updateIn(
      [editingColumnIndex, "tasks"],
      (tasks) => tasks.setIn([editingTaskIndex, "content"], taskContent)
    );
    this.setState(
      {
        editingColumnIndex: "",
        taskContent: "",
        editedTaskId: null,
        editingTaskIndex: null,
        columns: fromJS(updatedColumn),
      },
      () => {
        localStorage.setItem("columns", JSON.stringify(updatedColumn.toJS()));
      }
    );
  };
  handleCancelEdit = () => {
    this.setState({
      editingColumnIndex: "",
      taskContent: "",
      editedTaskId: null,
      editingTaskIndex: null,
    });
  };

  handleChangeSelectedColumn = (selectedColumn) => () => {
    this.setState({ selectedColumn: selectedColumn });
  };
  handleSaveDrag = (result) => {
    const { source, destination, reason } = result;
    if (reason === "DROP" && destination) {
      const { columns } = this.state;
      const sourcecolumnIndex = columns.findIndex(
        (column) => column.get("id") === source.droppableId
      );
      const task = columns.getIn([sourcecolumnIndex, "tasks", source.index]);
      let updatecolumn = columns.updateIn(
        [sourcecolumnIndex, "tasks"],
        (tasks) => tasks.remove(source.index)
      );
      const destinationcolumnIndex = columns.findIndex(
        (column) => column.get("id") === destination.droppableId
      );
      updatecolumn = updatecolumn.updateIn(
        [destinationcolumnIndex, "tasks"],
        (tasks) => tasks.insert(destination.index, task)
      );
      this.setState(
        {
          columns: fromJS(updatecolumn),
        },
        () => {
          localStorage.setItem("columns", JSON.stringify(updatecolumn.toJS()));
        }
      );
    }
  };
  render() {
    const {
      columns,
      displayModal,
      editingColumnIndex,
      taskContent,
      editedTaskId,
    } = this.state;

    return (
      <div className="App">
        <div id="toast"></div>
        <div className="title">TO DO LIST</div>
        <DragDropContext onDragEnd={this.handleSaveDrag}>
          <div className="container">
            {columns.map((column, columnIndex) => (
              <Column
                key={column.get("id")}
                column={column}
                handleAddNewTask={this.handleToggleModal}
              >
                <Droppable droppableId={column.get("id")}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ minHeight: "600px" }}
                    >
                      {column.get("tasks").map((task, taskIndex) => (
                        <Task
                          key={task.get("id")}
                          index={taskIndex}
                          isEditing={task.get("id") === editedTaskId}
                          handleChangeTaskContent={this.handleChangeTaskContent}
                          task={task}
                          handleEdit={this.handleEdit}
                          handleCancelEdit={this.handleCancelEdit}
                          handleChooseEditTask={this.handleChooseEditTask(
                            columnIndex,
                            taskIndex,
                            task.get("id")
                          )}
                          handleDeleteTask={this.handleDeleteTask(
                            columnIndex,
                            taskIndex
                          )}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Column>
            ))}
          </div>
        </DragDropContext>
        {displayModal && (
          <AddNewModal
            editingColumnIndex={editingColumnIndex}
            taskContent={taskContent}
            handleChangeTaskContent={this.handleChangeTaskContent}
            handleChangeEditingColumnIndex={this.handleChangeEditingColumnIndex}
            handleAddNewTask={this.handleAddNewModal}
            handleToggleModal={this.handleToggleModal()}
            selectedColumn={this.state.selectedColumn}
            handleChangeSelectedColumn={this.handleChangeSelectedColumn}
          />
        )}
      </div>
    );
  }
}
export default App;
