import React from "react";
import "./style.scss";

const Column = ({ column, handleAddNewTask, children }) => {
  return (
    <div className="column">
      <div className="column__header">
        <h2 className="column__title">
          <span className="column__item--count">
            {column.get("tasks").size}
          </span>
          <span className="column__text">{column.get("title")}</span>
        </h2>
        <p className="column__btn" onClick={handleAddNewTask(column.get("id"))}>
          <i className="fa-solid fa-plus"></i> &nbsp; New task
        </p>
      </div>
      <div className="column__content">{children}</div>
    </div>
  );
};

export default Column;
